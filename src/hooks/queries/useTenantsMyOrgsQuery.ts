"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type TenantLite = { id: string; name?: string; email?: string; phone?: string }

export function useTenantsMyOrgsQuery(search?: string, organizationId?: string) {
  return useQuery({
    queryKey: ['tenantsMyOrgs', search ?? '', organizationId ?? ''],
    queryFn: async () => {
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.TENANTS_MY_ORGS,
        method: 'GET',
        queryParams: {
          q: search && search.length > 0 ? search : undefined,
          organizationId,
        },
      })
      const list: TenantLite[] = Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray(res)
          ? (res as any)
          : []
      return list
    },
    staleTime: 60_000,
  })
}
