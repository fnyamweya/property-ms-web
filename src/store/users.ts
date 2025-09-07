import { apiClient } from '@/api'
import type {
  User,
  UsersListResponse,
  CreateUserPayload,
  CreateUserResponse,
} from '@/types/user'
import { create } from 'zustand'
import { ENDPOINTS } from '@/constants/endpoints'
// ✅ Zod schemas for runtime validation of the /users wrapper.
import { userListSchema } from '@/features/users/data/schema'

type LoadStatus = 'idle' | 'loading' | 'error'

interface UsersState {
  items: User[]
  status: LoadStatus
  error?: string

  page: number
  limit: number
  total: number
  totalPages: number

  // filters/sort (server-side ready; optional)
  q?: string
  sort?: string

  fetchUsers: (args?: {
    page?: number
    limit?: number
    q?: string
    sort?: string
  }) => Promise<void>

  createStatus: LoadStatus
  createError?: string
  createUser: (payload: CreateUserPayload) => Promise<User>
}

export const useUsersStore = create<UsersState>((set, get) => ({
  items: [],
  status: 'idle',
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,

  fetchUsers: async (args) => {
    const state = get()
    const page = args?.page ?? state.page
    const limit = args?.limit ?? state.limit
    const q = args?.q ?? state.q
    const sort = args?.sort ?? state.sort

    set({ status: 'loading', error: undefined })
    try {
      // Ask ApiClient for unknown; we'll validate with Zod.
      const resUnknown = await apiClient.request<unknown>({
        endpointKey: ENDPOINTS.GET_USERS,
        method: 'GET',
        queryParams: { page, limit, q, sort },
      })

      // Two safe paths:
      // 1) Expected wrapper { apiVersion, kind, data, pagination, ... }
      // 2) Defensive: some backends return a raw array
      if (Array.isArray(resUnknown)) {
        const data = resUnknown as User[]
        set({
          items: data,
          status: 'idle',
          page,
          limit,
          total: data.length,
          totalPages: 1,
          q,
          sort,
        })
        return
      }

      const parsed = userListSchema.parse(resUnknown) as UsersListResponse
      set({
        items: parsed.data,
        status: 'idle',
        page: parsed.pagination?.page ?? page,
        limit: parsed.pagination?.limit ?? limit,
        total: parsed.pagination?.total ?? parsed.data.length,
        totalPages: parsed.pagination?.totalPages ?? 1,
        q,
        sort,
      })
    } catch (err: any) {
      set({
        status: 'error',
        error:
          err?.message ??
          (typeof err === 'string' ? err : 'Failed to load users'),
      })
    }
  },

  createStatus: 'idle',
  createUser: async (payload) => {
    set({ createStatus: 'loading', createError: undefined })
    try {
      const res = await apiClient.request<CreateUserResponse>({
        endpointKey: ENDPOINTS.CREATE_USER,
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
      })

      // Optimistic insert at top
      set((s) => ({
        items: [res.data, ...s.items],
        createStatus: 'idle',
      }))
      return res.data
    } catch (err: any) {
      set({
        createStatus: 'error',
        createError:
          err?.message ?? (typeof err === 'string' ? err : 'Create failed'),
      })
      throw err
    }
  },
}))
