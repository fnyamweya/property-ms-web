'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type Lease = {
  id: string
  type?: string
  status?: string
  amount?: number
  currency?: string
  frequency?: string
  charges?: Array<{ name?: string; amount?: number; currency?: string }> | any[]
  startDate?: string
  endDate?: string
}

function pickCurrent(list: Lease[]): Lease | undefined {
  if (!Array.isArray(list) || list.length === 0) return undefined
  const now = new Date()
  // Prefer active; else with endDate in future; else first
  const active = list.find((l) => (l.status ?? '').toLowerCase() === 'active')
  if (active) return active
  const future = list.find((l) => (l.endDate ? new Date(l.endDate) : now) > now)
  return future ?? list[0]
}

export function useUnitLeases(propertyId?: string, unitId?: string) {
  const [leases, setLeases] = useState<Lease[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | undefined>(undefined)

  const current = useMemo(() => pickCurrent(leases), [leases])

  const refetch = async () => {
    if (!propertyId || !unitId) return
    setStatus('loading')
    setError(undefined)
    try {
      const data = await apiClient.request<any>({
        endpointKey: ENDPOINTS.GET_UNIT_LEASES,
        method: 'GET',
        pathParams: { propertyId, unitId },
      })
      const list: Lease[] = Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray(data)
          ? (data as any)
          : []
      setLeases(list)
      setStatus('idle')
    } catch (e: any) {
      setStatus('error')
      setError(e?.message ?? 'Failed to load leases')
    }
  }

  useEffect(() => {
    setLeases([])
    if (propertyId && unitId) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, unitId])

  return { leases, current, status, error, refetch }
}
