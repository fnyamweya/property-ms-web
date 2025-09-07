import { apiClient } from '@/api'
import { create } from 'zustand'
import { ENDPOINTS } from '@/constants/endpoints'

type RequestStatus = 'idle' | 'loading' | 'error'

export interface OrgRequest {
  id: string
  type?: string
  status?: string
  property?: { id: string; name?: string }
  unit?: { id: string; unitNumber?: string; name?: string }
  requester?: { id: string; name?: string }
  assignee?: { id: string; name?: string }
}

interface RequestsState {
  requests: OrgRequest[]
  status: RequestStatus
  error?: string
  fetchMyOrgRequests: (organizationId?: string) => Promise<void>
}

export const useOrgRequestsStore = create<RequestsState>((set) => ({
  requests: [],
  status: 'idle',
  async fetchMyOrgRequests(organizationId?: string) {
    set({ status: 'loading', error: undefined })
    try {
      const data = await apiClient.request<any>({
        endpointKey: ENDPOINTS.REQUESTS_MY_ORGS,
        method: 'GET',
        queryParams: organizationId ? { organizationId } : undefined,
      })
      const list = (Array.isArray((data as any)?.data) ? (data as any).data : data) as OrgRequest[]
      set({ requests: list ?? [], status: 'idle', error: undefined })
    } catch (e: any) {
      set({ status: 'error', error: e?.message ?? 'Failed to load requests' })
    }
  },
}))
