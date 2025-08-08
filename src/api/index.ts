/*
 * Api client singleton.
 *
 * This module exports a shared instance of the ApiClient configured with
 * settings defined in src/config/api.ts. Importing from this file ensures
 * that only one client is created per application instance, which in turn
 * ensures that token state and interceptors are shared globally.
 */

import { ApiClient } from './ApiClient'
import { apiConfig } from '@/config/api'

export const apiClient = new ApiClient(apiConfig)

export default apiClient