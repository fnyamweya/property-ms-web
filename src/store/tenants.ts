import { apiClient } from '@/api'
import { create } from 'zustand'
import { ENDPOINTS } from '@/constants/endpoints'

type RequestStatus = 'idle' | 'loading' | 'error'

export interface Tenant {
  id: string
  name?: string
  email?: string
  phone?: string
  property?: { id: string; name?: string }
  unit?: { id: string; unitNumber?: string; name?: string }
  user?: { id: string; firstName?: string; lastName?: string }
}

interface TenantsState {
  tenants: Tenant[]
  status: RequestStatus
  error?: string
  fetchMyOrgTenants: (organizationId?: string) => Promise<void>
}

export const useTenantsStore = create<TenantsState>((set) => ({
  tenants: [],
  status: 'idle',
  async fetchMyOrgTenants(organizationId?: string) {
    set({ status: 'loading', error: undefined })
    try {
      const data = await apiClient.request<any>({
        endpointKey: ENDPOINTS.TENANTS_MY_ORGS,
        method: 'GET',
        queryParams: organizationId ? { organizationId } : undefined,
      })
      const list = (Array.isArray((data as any)?.data) ? (data as any).data : data) as Tenant[]
      set({ tenants: list ?? [], status: 'idle', error: undefined })
    } catch (e: any) {
      set({ status: 'error', error: e?.message ?? 'Failed to load tenants' })
    }
  },
}))
