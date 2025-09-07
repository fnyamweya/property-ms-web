'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type TenantLease = {
  id: string
  type?: string
  status?: string
  amount?: number
  currency?: string
  frequency?: string
  startDate?: string
  endDate?: string
  property?: { id: string; name?: string }
  unit?: { id: string; unitNumber?: string; name?: string }
}

export function useTenantLeases(tenantId?: string, organizationId?: string) {
  const [leases, setLeases] = useState<TenantLease[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | undefined>(undefined)

  async function refetch() {
    if (!tenantId) return
    setStatus('loading')
    setError(undefined)
    try {
      const data = await apiClient.request<any>({
        endpointKey: ENDPOINTS.GET_TENANT_LEASES,
        method: 'GET',
        pathParams: { tenantId },
        queryParams: organizationId ? { organizationId } : undefined,
      })
      const list: TenantLease[] = Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray(data)
          ? (data as any)
          : []
      setLeases(list)
      setStatus('idle')
    } catch (e: any) {
      setStatus('error')
      setError(e?.message ?? 'Failed to load tenant leases')
    }
  }

  useEffect(() => {
    setLeases([])
    if (tenantId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, organizationId])

  return { leases, status, error, refetch }
}
