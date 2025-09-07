"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type ArrearsRow = { leaseId: string; tenantId: string; unitId: string; outstanding: number; maxDaysPastDue: number }
export type Arrears = { summary: Record<'0-30'|'31-60'|'61-90'|'90+', number>; rows: ArrearsRow[] }

export function useArrearsQuery(propertyId?: string, asOf?: string) {
  return useQuery({
    queryKey: ['arrears', propertyId ?? '', asOf ?? ''],
    enabled: !!propertyId && !!asOf,
    queryFn: async () => {
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.ARREARS,
        method: 'GET',
        pathParams: { propertyId: String(propertyId) },
        queryParams: { asOf },
      })
      const data = (res as any)?.data ?? res
      const safe: Arrears = {
        summary: (data?.summary ?? {}) as Arrears['summary'],
        rows: Array.isArray(data?.rows) ? data.rows : [],
      }
      return safe
    },
    staleTime: 60_000,
  })
}

