/*
 * User model definition. This interface describes the common fields returned
 * by the backend when requesting a user or performing authentication.
 * Additional properties can be added here as your API evolves. Keeping this
 * type in one place encourages consistent usage across your application.
 */

export interface User {
  id: string
  name: string
  email: string
  /** Optional display name shown in the UI. */
  username?: string
  /** Any other properties returned by the API can be declared here. */
  [key: string]: unknown
}