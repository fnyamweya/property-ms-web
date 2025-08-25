/*
 * User store slice. Maintains a collection of users along with loading and
 * error state. Provides an async action for fetching a paginated list of
 * users from the backend. Consumers can use this hook directly or via
 * selectors in specialised hooks.
 */
import { apiClient } from '@/api'
import type { User } from '@/types/user'
import { create } from 'zustand'
import { parseError } from '@/utils/errorParser'
import { ENDPOINTS } from '@/constants/endpoints'

export type UsersStatus = 'idle' | 'loading' | 'error'

interface UsersState {
  users: User[]
  status: UsersStatus
  error?: string
  /**
   * Fetch a list of users from the API. Accepts optional pagination
   * parameters which are forwarded as query parameters on the request. On
   * success the returned users are stored; on error the message is
   * captured.
   */
  fetchUsers: (params?: { page?: number; limit?: number }) => Promise<void>
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  status: 'idle',
  error: undefined,
  async fetchUsers(params?: { page?: number; limit?: number }) {
    set({ status: 'loading', error: undefined })
    try {
      const data = await apiClient.request<User[]>({
        endpointKey: ENDPOINTS.CREATE_USER,
        method: 'POST',
        body: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
        queryParams: params as any,
      })
      set({ users: data, status: 'idle', error: undefined })
    } catch (err) {
      set({ status: 'error', error: parseError(err) })
    }
  },
}))
