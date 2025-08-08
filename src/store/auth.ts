/*
 * Authentication state management using Zustand.
 *
 * This store centralises all logic related to user authentication including
 * logging in, logging out and refreshing tokens. It also exposes
 * convenient status flags for UI components to show spinners or error
 * messages. By encapsulating token updates inside the store and ApiClient
 * instance we ensure that all subsequent API calls automatically include
 * the correct Authorization header.
 */
import { apiClient } from '@/api'
import type { LoginResponse, LoginRequest } from '@/types/auth'
import type { User } from '@/types/user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { parseError } from '@/utils/errorParser'
import { ENDPOINTS } from '@/constants/endpoints'

export type AuthStatus = 'idle' | 'loading' | 'error'

interface AuthState {
  user?: User
  accessToken?: string
  refreshToken?: string
  status: AuthStatus
  error?: string
  /**
   * Perform a login by sending credentials to the API. On success the
   * returned tokens are stored both in the ApiClient and this store. On
   * failure the error message is captured for display by the UI.
   */
  login: (credentials: LoginRequest) => Promise<void>
  /**
   * Clear all authentication data. After logout no protected routes may be
   * accessed until login is called again.
   */
  logout: () => void
  /**
   * Attempt to refresh tokens proactively. This method can be called
   * periodically if required to keep the user logged in. The ApiClient
   * already attempts a refresh automatically when a 401 is received, so
   * calling this manually is optional.
   */
  refresh: () => Promise<void>
  /**
   * Set new tokens without performing any network request. This helper is
   * exposed mainly to support token refresh logic.
   */
  setTokens: (accessToken: string, refreshToken: string) => void
  /**
   * Fetch the current user profile from the API. This is useful to ensure
   * the user object is always up-to-date after login or refresh.
   */
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: undefined,
      accessToken: undefined,
      refreshToken: undefined,
      status: 'idle',
      error: undefined,

      async login(credentials: LoginRequest) {
        set({ status: 'loading', error: undefined })
        try {
          const response = await apiClient.request<LoginResponse>({
            endpointKey: ENDPOINTS.LOGIN,
            method: 'POST',
            body: credentials,
          })
          const { accessToken, refreshToken, user } = response.data
          // Persist tokens on the ApiClient instance.
          apiClient.setTokens({ accessToken, refreshToken })
          set({
            user,
            accessToken,
            refreshToken,
            status: 'idle',
            error: undefined,
          })
        } catch (err) {
          set({ status: 'error', error: parseError(err) })
        }
      },

      logout() {
        apiClient.clearTokens()
        set({
          user: undefined,
          accessToken: undefined,
          refreshToken: undefined,
          status: 'idle',
          error: undefined,
        })
      },

      async refresh() {
        try {
          // If no refresh token is available there is nothing to do.
          const refreshToken = get().refreshToken
          if (!refreshToken) return
          const response = await apiClient.request<LoginResponse>({
            endpointKey: ENDPOINTS.REFRESH,
            method: 'POST',
            body: { refreshToken },
          })
          const {
            accessToken,
            refreshToken: newRefreshToken,
            user,
          } = response.data
          apiClient.setTokens({ accessToken, refreshToken: newRefreshToken })
          set({
            user: user ?? get().user,
            accessToken,
            refreshToken: newRefreshToken,
            status: 'idle',
            error: undefined,
          })
        } catch (err) {
          // On refresh failure wipe tokens and surface the error.
          apiClient.clearTokens()
          set({
            user: undefined,
            accessToken: undefined,
            refreshToken: undefined,
            status: 'error',
            error: parseError(err),
          })
        }
      },

      setTokens(accessToken: string, refreshToken: string) {
        apiClient.setTokens({ accessToken, refreshToken })
        set({ accessToken, refreshToken })
      },

      async fetchMe() {
        set({ status: 'loading', error: undefined })
        try {
          const res = await apiClient.request<{ message: string; data: User }>({
            endpointKey: ENDPOINTS.ME,
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().accessToken}`,
            },
          })
          set({ user: res.data.data as User, status: 'idle', error: undefined })
        } catch (err) {
          set({ status: 'error', error: parseError(err) })
        }
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
