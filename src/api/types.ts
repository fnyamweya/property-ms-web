/*
 * API type definitions and errors.
 *
 * This module centralises the core TypeScript interfaces used by the API
 * client. By keeping these definitions in a single place it becomes easy to
 * extend the client with new HTTP verbs or error types without having to
 * modify dozens of files. All consumer code should import types from this
 * file rather than duplicating shape definitions elsewhere.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'

/**
 * Configuration for the API client. The base URL should point to the root of
 * your backend service. Endpoints are defined by key/value pairs where the
 * key is a friendly name used throughout the client and the value is the
 * relative path to call. Default headers and timeouts can also be set here.
 */
export interface ApiConfig {
  /**
   * The base URL used to prefix all requests. It should not contain any
   * trailing slashes.
   */
  baseUrl: string
  /**
   * A dictionary of endpoint keys to URL path templates. Path parameters are
   * expressed with a leading colon, e.g. "/users/:id".
   */
  endpoints: Record<string, string>
  /**
   * Optional default headers applied to every request. These values can be
   * overridden on a per‑call basis.
   */
  defaultHeaders?: Record<string, string>
  /**
   * Global timeout in milliseconds for each request. If omitted the client
   * library sets a sensible default.
   */
  timeoutMs?: number
}

/**
 * Options accepted by the ApiClient.request method. At a minimum you must
 * supply an endpoint key which maps to an entry in ApiConfig.endpoints. The
 * remaining properties are optional and control how the request is built.
 */
export interface RequestOptions {
  /**
   * The key into ApiConfig.endpoints describing which URL template to use.
   */
  endpointKey: keyof ApiConfig['endpoints'] | string
  /**
   * HTTP method. Defaults to GET if omitted.
   */
  method?: HttpMethod
  /**
   * Values used to interpolate dynamic segments in the URL template. For
   * example, if the template is "/users/:id" then a pathParams of
   * { id: 123 } will produce "/users/123".
   */
  pathParams?: Record<string, string | number>
  /**
   * Query string parameters appended to the URL. Values will be URL
   * encoded. Only defined values will be included.
   */
  queryParams?: Record<string, string | number | undefined>
  /**
   * The request payload for methods such as POST or PUT. This value will be
   * passed directly to axios as the `data` property.
   */
  body?: unknown
  /**
   * Optional headers specific to this request. These will be merged with
   * ApiConfig.defaultHeaders; per‑call headers override defaults.
   */
  headers?: Record<string, string>
}

/**
 * A strongly typed error used throughout the ApiClient. When a network error
 * or HTTP error occurs the client throws an ApiError containing the HTTP
 * status code and any JSON body returned by the server. Consumers can
 * examine the `status` property to implement custom handling logic.
 */
export class ApiError extends Error {
  public status?: number

  public data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}