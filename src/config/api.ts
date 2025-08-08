/*
 * API configuration for the application. This file defines the base URL
 * (sourced from Vite environment variables) and maps friendly endpoint
 * identifiers to their relative paths. Changing the base URL or path
 * definitions here automatically updates all calls made through the
 * ApiClient. Developers can override these values for different
 * environments by providing alternative .env files (see .env.example).
 */
import type { ApiConfig } from '@/api/types'
import { ENDPOINTS } from '@/constants/endpoints'

export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  endpoints: {
    [ENDPOINTS.LOGIN]: '/auth/login',
    [ENDPOINTS.REFRESH]: '/auth/refresh',
    [ENDPOINTS.GET_USERS]: '/users',
    [ENDPOINTS.CREATE_USER]: '/users',
    [ENDPOINTS.ME]: '/auth/me',
    [ENDPOINTS.LOGOUT]: '/auth/logout',
  },
  defaultHeaders: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeoutMs: 10000,
}
