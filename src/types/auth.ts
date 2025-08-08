/*
 * Authentication response and request shapes. These types describe the
 * contract between the frontend and your backend API. Define only the
 * properties that are actually returned by your service; unknown extras are
 * captured with index signatures to maintain type safety when merging
 * partial responses.
 */

import type { User } from './user'

export interface LoginResponse {
  message?: string
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
  [key: string]: unknown
}

export interface LoginRequest {
  /**
   * Identifier used to log in. This could be an email address, username or
   * phone number depending on your backend implementation.
   */
  identifier: string
  /**
   * Credential matching the identifier (e.g. password or OTP).
   */
  credential: string
}