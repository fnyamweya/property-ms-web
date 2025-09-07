"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type Lease = {
  id: string
  leaseType?: string
  type?: string
  amount?: number
  currency?: string
  paymentFrequency?: string
  frequency?: string
  charges?: Array<{ name?: string; amount?: number; currency?: string }>
  startDate?: string
  endDate?: string
  nextDueDate?: string
}

export function useUnitLeasesQuery(propertyId?: string, unitId?: string) {
  return useQuery({
    enabled: !!propertyId && !!unitId,
    queryKey: ['unitLeases', propertyId, unitId],
    queryFn: async () => {
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.GET_UNIT_LEASES,
        method: 'GET',
        pathParams: { propertyId: propertyId!, unitId: unitId! },
      })
      const list: Lease[] = Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray(res)
          ? (res as any)
          : []
      return list
    },
    staleTime: 30_000,
  })
}
