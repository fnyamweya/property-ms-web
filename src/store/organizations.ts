import { apiClient } from '@/api'
import { useAuthStore as useAuthAuthStore } from '@/store/auth'
import type { Organization } from '@/types/organization'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ENDPOINTS } from '@/constants/endpoints'
import { userOrganizationsSchema } from '@/features/organizations/data/schema'

type LoadStatus = 'idle' | 'loading' | 'error'

interface OrganizationsState {
  byUserId: Record<string, Organization[]>
  status: LoadStatus
  error?: string
  fetchUserOrganizations: (userId: string) => Promise<Organization[]>
  createOrganization: (payload: { name: string; plan?: string | null; logoUrl?: string | null }) => Promise<Organization | null>
  // membership creation (associate user with an organization)
  addMember: (params: { organizationId: string; userId: string; roles?: string[] }) => Promise<boolean>
  // selected organization
  selectedId?: string
  setSelected: (id?: string) => void
}

export const useOrganizationsStore = create<OrganizationsState>()(
  persist(
    (set, _get) => ({
      byUserId: {},
      status: 'idle',

      fetchUserOrganizations: async (userId: string) => {
        if (!userId) {
          set({ status: 'error', error: 'Missing userId' })
          return []
        }

        set({ status: 'loading', error: undefined })
        try {
          const resUnknown = await apiClient.request<unknown>({
            endpointKey: ENDPOINTS.GET_USER_ORGANIZATIONS,
            method: 'GET',
            pathParams: { userId },
          })
          const parsed = userOrganizationsSchema.parse(resUnknown)
          set((s) => ({
            byUserId: { ...s.byUserId, [userId]: parsed.data },
            status: 'idle',
          }))
          return parsed.data
        } catch (err: any) {
          set({
            status: 'error',
            error: err?.message ?? 'Failed to load organizations',
          })
          return []
        }
      },

      createOrganization: async (payload) => {
        set({ status: 'loading', error: undefined })
        try {
          // Accept either enveloped or raw responses
          const res = await apiClient.request<any>({
            endpointKey: ENDPOINTS.CREATE_ORGANIZATION,
            method: 'POST',
            body: payload,
            headers: (() => {
              const token = useAuthAuthStore.getState().accessToken
              return token ? { Authorization: `Bearer ${token}` } : undefined
            })(),
          })
          const created: Organization = res?.data ?? res
          set({ status: 'idle' })
          return created as Organization
        } catch (err: any) {
          set({ status: 'error', error: err?.message ?? 'Failed to create organization' })
          return null
        }
      },

      addMember: async ({ organizationId, userId, roles = ['owner'] }) => {
        try {
          await apiClient.request<any>({
            endpointKey: ENDPOINTS.ADD_ORGANIZATION_MEMBER,
            method: 'POST',
            pathParams: { organizationId },
            body: { userId, roles, status: 'active' },
            headers: (() => {
              const token = useAuthAuthStore.getState().accessToken
              return token ? { Authorization: `Bearer ${token}` } : undefined
            })(),
          })
          return true
        } catch (err: any) {
          set({ error: err?.message ?? 'Failed to add member' })
          return false
        }
      },

      selectedId: undefined,
      setSelected: (id) => {
        apiClient.setOrgId(id)
        set({ selectedId: id })
      },
    }),
    {
      name: 'organizations',
      onRehydrateStorage: () => (state) => {
        const id = state?.selectedId
        if (id) apiClient.setOrgId(id)
      },
      partialize: (state) => ({ selectedId: state.selectedId }),
    }
  )
)
