/*
 * ApiClient implementation.
 *
 * The ApiClient is a thin wrapper around axios that handles the mundane
 * concerns of building URLs, attaching authentication headers, retrying
 * idempotent calls on network errors and parsing error responses into a
 * consistent format. It is intentionally generic and can be reused across
 * multiple features or even projects as long as the ApiConfig shape is
 * respected. Consumers should never reach into the underlying axios
 * instance; instead rely on the public methods exported here.
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import type { ApiConfig, RequestOptions, HttpMethod } from './types'
import { ApiError } from './types'

/**
 * Determines whether an error is due to a network issue. Axios signals
 * network errors by omitting the `response` property on the error object.
 */
function isNetworkError(error: AxiosError): boolean {
  return !error.response
}

/**
 * Sleep for a given duration. Used to implement exponential backoff for
 * retries.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiClient {
  private readonly axios: AxiosInstance

  private readonly config: ApiConfig

  private accessToken?: string

  private refreshToken?: string

  /**
   * A promise representing an in‑flight refresh call. Only one refresh
   * operation should happen at any time; concurrent 401 responses queue
   * behind this promise.
   */
  private refreshPromise: Promise<void> | null = null

  constructor(config: ApiConfig) {
    this.config = config
    this.axios = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs ?? 15000,
      headers: config.defaultHeaders ?? {},
    })

    // Request interceptor: attach bearer token when present. We mutate the
    // headers object rather than replacing it entirely to preserve the
    // AxiosHeaders type. Casting to any avoids TypeScript complaining about
    // indexing AxiosHeaders with arbitrary keys.
    this.axios.interceptors.request.use((req) => {
      if (this.accessToken) {
        ;(req.headers as any) = req.headers || {}
        ;(req.headers as any).Authorization = `Bearer ${this.accessToken}`
      }
      return req
    })

    // Response interceptor: handle 401s by attempting a single refresh.
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const axiosError = error as AxiosError
        // If we received a 401 and a refresh token is available, attempt to refresh once.
        if (
          axiosError.response?.status === 401 &&
          this.refreshToken &&
          !(
            (axiosError.config as any)?.metadata?.retried &&
            (axiosError.config as any)?.metadata?.retried === true
          )
        ) {
          // Ensure only one refresh call happens concurrently.
          if (!this.refreshPromise) {
            this.refreshPromise = this.refreshTokens()
          }
          try {
            await this.refreshPromise
            this.refreshPromise = null
            // Mark the original request as retried to avoid infinite loops.
            ;(axiosError.config as any).metadata = {
              ...(axiosError.config as any).metadata,
              retried: true,
            }
            return this.axios.request(axiosError.config as AxiosRequestConfig)
          } catch (refreshErr) {
            this.refreshPromise = null
            // Refresh failed – clear tokens and propagate the original error.
            this.clearTokens()
            throw refreshErr
          }
        }
        // Otherwise propagate error directly.
        throw error
      }
    )
  }

  /**
   * Mutate the ApiClient with new authentication tokens. This does not
   * automatically persist tokens anywhere; the caller must decide how to
   * persist them (e.g. localStorage, cookies, etc.).
   */
  public setTokens(tokens: { accessToken: string; refreshToken: string }): void {
    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken
  }

  /**
   * Clear any stored authentication tokens. All subsequent requests will be
   * made unauthenticated until new tokens are set.
   */
  public clearTokens(): void {
    this.accessToken = undefined
    this.refreshToken = undefined
  }

  /**
   * Attempt to refresh the access token using the configured refresh
   * endpoint. If no refresh endpoint is configured a rejected promise is
   * returned. On success the new tokens are stored on the client.
   */
  private async refreshTokens(): Promise<void> {
    // Find a refresh endpoint in the config – match either a key named
    // "refresh" or an endpoint path that contains '/auth/refresh'.
    const entry = Object.entries(this.config.endpoints).find(
      ([key, value]) =>
        key.toLowerCase().includes('refresh') ||
        value.toLowerCase().includes('/refresh')
    )
    if (!entry) {
      throw new ApiError('No refresh endpoint configured')
    }
    const [endpointKey] = entry
    try {
      const response = await this.axios.post(this.config.endpoints[endpointKey], {
        refreshToken: this.refreshToken,
      })
      // Expect the server to return a shape like { data: { accessToken, refreshToken } }
      const data: any = response.data
      const newAccess = data?.data?.accessToken ?? data?.accessToken
      const newRefresh = data?.data?.refreshToken ?? data?.refreshToken
      if (!newAccess) {
        throw new ApiError('Refresh response missing access token')
      }
      this.setTokens({ accessToken: newAccess, refreshToken: newRefresh })
    } catch (err) {
      const error = err as AxiosError
      throw new ApiError(
        error.message,
        error.response?.status,
        error.response?.data
      )
    }
  }

  /**
   * Construct the final URL by combining the endpoint template with any
   * supplied path and query parameters. If no endpoint is found for
   * `endpointKey` the key is used as the literal path to allow fully
   * qualified URLs.
   */
  private buildUrl(
    endpointKey: string,
    pathParams?: Record<string, string | number>,
    queryParams?: Record<string, string | number | undefined>
  ): string {
    let template = this.config.endpoints[endpointKey] ?? endpointKey
    // Replace path parameters.
    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        template = template.replace(`:${key}`, encodeURIComponent(String(value)))
      })
    }
    // Append query string if provided.
    if (queryParams) {
      const entries = Object.entries(queryParams).filter(([, v]) => v !== undefined)
      if (entries.length > 0) {
        const query = entries
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v!))}`)
          .join('&')
        template += template.includes('?') ? `&${query}` : `?${query}`
      }
    }
    return template
  }

  /**
   * Send an HTTP request. The method defaults to GET if omitted. If the
   * request fails due to a network error and the method is idempotent the
   * client will retry up to three times with exponential backoff. All
   * successful responses return the response body (assumed JSON) cast to
   * the requested type. Errors throw ApiError.
   */
  public async request<T>(options: RequestOptions): Promise<T> {
    const {
      endpointKey,
      method = 'GET',
      pathParams,
      queryParams,
      body,
      headers,
    } = options
    const url = this.buildUrl(endpointKey as string, pathParams, queryParams)
    const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
    const maxRetries = 3

    let attempt = 0
    // Closure for executing the request; defined once to avoid code duplication.
    const execute = async (): Promise<T> => {
      try {
        const response = await this.axios.request<T>({
          url,
          method: method as HttpMethod,
          data: body,
          headers,
        })
        return response.data as T
      } catch (err) {
        const error = err as AxiosError
        // Retry network errors on idempotent requests.
        if (isIdempotent && isNetworkError(error) && attempt < maxRetries) {
          attempt++
          // Exponential backoff: 100ms, 200ms, 400ms
          await sleep(100 * 2 ** (attempt - 1))
          return execute()
        }
        // Normalise error into ApiError.
        if (axios.isAxiosError(error)) {
          throw new ApiError(
            error.message,
            error.response?.status,
            error.response?.data
          )
        }
        throw new ApiError('Unknown error')
      }
    }
    return execute()
  }
}