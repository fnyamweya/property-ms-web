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

    [ENDPOINTS.GET_LOCATIONS]: '/locations',
    [ENDPOINTS.GET_LOCATION]: '/locations/:id',
    [ENDPOINTS.CREATE_LOCATION]: '/locations',
    [ENDPOINTS.UPDATE_LOCATION]: '/locations/:id',
    [ENDPOINTS.DELETE_LOCATION]: '/locations/:id',
    [ENDPOINTS.RESTORE_LOCATION]: '/locations/:id/restore',
    [ENDPOINTS.GET_LOCATION_PARENTS]: '/locations/parents',
    [ENDPOINTS.GET_LOCATION_CHILDREN]: '/locations/children',

    // Property endpoints. These are stubbed paths for demonstration. When
    // connecting to a real backend, ensure the routes match your API
    // contract. By default we assume RESTful semantics with plural
    // collections and singular resources distinguished by an ID parameter.
    [ENDPOINTS.GET_PROPERTIES]: '/properties',
    [ENDPOINTS.GET_PROPERTY]: '/properties/:id',
    [ENDPOINTS.CREATE_PROPERTY]: '/properties',
    [ENDPOINTS.UPDATE_PROPERTY]: '/properties/:id',
    [ENDPOINTS.DELETE_PROPERTY]: '/properties/:id',
    [ENDPOINTS.RESTORE_PROPERTY]: '/properties/:id/restore',

    [ENDPOINTS.GET_PROPERTY_UNITS]: '/properties/:id/units',
    [ENDPOINTS.GET_PROPERTY_UNIT]: '/properties/:id/units/:unitId',
    [ENDPOINTS.CREATE_PROPERTY_UNIT]: '/properties/:id/units',
    [ENDPOINTS.UPDATE_PROPERTY_UNIT]: '/properties/:id/units/:unitId',
    [ENDPOINTS.DELETE_PROPERTY_UNIT]: '/properties/:id/units/:unitId',
    [ENDPOINTS.RESTORE_PROPERTY_UNIT]: '/properties/:id/units/:unitId/restore',
    [ENDPOINTS.GET_PROPERTY_UNIT_BY_NUMBER]: '/properties/:id/units/by-number',
  },
  defaultHeaders: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeoutMs: 10000,
}
