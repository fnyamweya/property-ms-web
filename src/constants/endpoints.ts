/*
 * API endpoint keys used throughout the application. Centralising these keys
 * makes it trivial to update an endpoint path in one place without hunting
 * through dozens of files. Keys are intentionally written in SNAKE_CASE to
 * clearly indicate their constant nature.
 */

export const ENDPOINTS = {
  LOGIN: 'login',
  REFRESH: 'refresh',
  ME: 'me',
  LOGOUT: 'logout',
  GET_USERS: 'getUsers',
  CREATE_USER: 'createUser',
} as const

export type EndpointKey = keyof typeof ENDPOINTS
