"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type RentRollRow = { leaseId: string; unitId: string; tenantId: string; due: number; paid: number; balance: number }

export function useRentRollQuery(propertyId?: string, month?: string) {
  return useQuery({
    queryKey: ['rentRoll', propertyId ?? '', month ?? ''],
    enabled: !!propertyId && !!month,
    queryFn: async () => {
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.RENT_ROLL,
        method: 'GET',
        pathParams: { propertyId: String(propertyId) },
        queryParams: { month },
      })
      const rows: RentRollRow[] = Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray(res)
          ? (res as any)
          : []
      return rows
    },
    staleTime: 60_000,
  })
}

