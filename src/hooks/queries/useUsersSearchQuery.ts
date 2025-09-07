"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type UserLite = { id: string; firstName?: string; lastName?: string; email?: string; phone?: string }

export function useUsersSearchQuery(search?: string) {
  return useQuery({
    queryKey: ['usersSearch', search ?? ''],
    queryFn: async () => {
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.GET_USERS,
        method: 'GET',
        queryParams: {
          q: search && search.length > 0 ? search : undefined,
          limit: 20,
        },
      })
      const list: UserLite[] = Array.isArray((res as any)?.data)
        ? (res as any).data
        : Array.isArray(res)
          ? (res as any)
          : []
      return list
    },
    staleTime: 60_000,
  })
}

