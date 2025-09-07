/*
 * Hook for accessing authentication state from React components. This wrapper
 * around useAuthStore exposes both state and actions in a single object to
 * simplify consumption. Consumers can destructure the returned object to
 * access individual values or functions without pulling in the entire
 * Zustand API.
 */
import { useAuthStore } from '@/store/auth'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const meFetched = useAuthStore((state) => state.meFetched)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const refresh = useAuthStore((state) => state.refresh)
  const setTokens = useAuthStore((state) => state.setTokens)
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const ensureMe = useAuthStore((state) => state.ensureMe)
  const appendOrganization = useAuthStore((state) => state.appendOrganization)
  return {
    user,
    accessToken,
    refreshToken,
    status,
    error,
    meFetched,
    login,
    logout,
    refresh,
    setTokens,
    fetchMe,
    ensureMe,
    appendOrganization,
  }
}
