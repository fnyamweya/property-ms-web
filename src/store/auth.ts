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
  // prevent repeated /me fetches and coalesce concurrent calls
  meFetched?: boolean
  ensureMe: () => Promise<void>
  appendOrganization: (org: { id: string; name: string; plan?: string | null; logoUrl?: string | null }) => void
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
      meFetched: false,
      // internal promise holder (not persisted)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _mePromise: null,

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
            method: 'GET',
            headers: {
              Authorization: `Bearer ${get().accessToken}`,
            },
            returnResponse: true,
          })
          const data = (res as any).data as { message: string; data: User }
          const headers = (res as any).headers as Record<string, string | undefined>
          const bodyUser = data.data as User
          const hintedOrgId =
            (headers && (headers['x-current-org-id'] as string | undefined)) ||
            bodyUser.currentOrganizationId ||
            undefined
          set({
            user: bodyUser,
            status: 'idle',
            error: undefined,
            meFetched: true,
          })
          if (hintedOrgId) {
            try {
              // Avoid importing the organizations store to prevent cycles
              apiClient.setOrgId(hintedOrgId)
            } catch {}
          }
        } catch (err) {
          set({ status: 'error', error: parseError(err) })
        }
      },

      async ensureMe() {
        const state = get()
        if (state.user || state.meFetched) return
        // reuse in-flight call if present
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (state._mePromise) return state._mePromise
        const p = state
          .fetchMe()
          .catch(() => {})
          .finally(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            set({ _mePromise: null })
          })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        set({ _mePromise: p })
        return p
      },

      appendOrganization(org) {
        set((s) => {
          const current = s.user as any
          if (!current) return s as any
          const nextOrgs = Array.isArray(current.organizations)
            ? [...current.organizations, org]
            : [org]
          const nextIds = Array.isArray(current.organizationIds)
            ? [...current.organizationIds, org.id]
            : [org.id]
          return {
            ...s,
            user: { ...current, organizations: nextOrgs, organizationIds: nextIds },
          }
        })
      },
    }),
    {
      name: 'auth',
      // Ensure the ApiClient has tokens after persistence rehydrates
      onRehydrateStorage: () => (state, error) => {
        if (error) return
        const accessToken = state?.accessToken
        const refreshToken = state?.refreshToken
        if (accessToken && refreshToken) {
          try {
            apiClient.setTokens({ accessToken, refreshToken })
          } catch {}
        }
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
