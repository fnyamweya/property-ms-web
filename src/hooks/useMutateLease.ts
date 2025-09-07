import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type LeasePayload = {
  type?: string
  amount?: number
  currency?: string
  frequency?: string
  startDate?: string
  endDate?: string
  tenantId?: string
  charges?: Array<{ name?: string; amount?: number; currency?: string }>
}

export function useMutateLease() {
  async function createUnitLease(propertyId: string, unitId: string, payload: LeasePayload) {
    return apiClient.request<any>({
      endpointKey: ENDPOINTS.ADD_UNIT_LEASE,
      method: 'POST',
      pathParams: { propertyId, unitId },
      body: payload,
    })
  }
  async function updateLease(propertyId: string, unitId: string, leaseId: string, payload: LeasePayload & { propertyId?: string; unitId?: string }) {
    return apiClient.request<any>({
      endpointKey: ENDPOINTS.UPDATE_LEASE,
      method: 'PUT',
      pathParams: { leaseId, propertyId, unitId },
      body: payload,
    })
  }
  return { createUnitLease, updateLease }
}
