"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'

export type LedgerPayment = { id: string; amount: number; paidAt: string }
export type LedgerPeriod = { dueDate: string; amountDue: number; amountPaid: number; balance: number; payments: LedgerPayment[] }
export type LeaseLedger = { lease: any; periods: LedgerPeriod[]; totals: { totalDue: number; totalPaid: number; outstanding: number } }

export function useLeaseLedgerQuery(leaseId?: string) {
  return useQuery({
    queryKey: ['leaseLedger', leaseId ?? ''],
    enabled: !!leaseId,
    queryFn: async () => {
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.LEASE_LEDGER,
        method: 'GET',
        pathParams: { id: String(leaseId) },
      })
      const data: LeaseLedger = (res as any)?.data ?? res
      return data
    },
    staleTime: 60_000,
  })
}

