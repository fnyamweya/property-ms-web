'use client'
import { CreditCard, Plus, FileDown, Table as TableIcon, ListOrdered } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import * as React from 'react'
import { useUnitLeasesQuery } from '@/hooks/queries/useUnitLeasesQuery'
import { useLeaseLedgerQuery } from '@/hooks/queries/useLeaseLedgerQuery'
import { useRentRollQuery } from '@/hooks/queries/useRentRollQuery'
import { useArrearsQuery } from '@/hooks/queries/useArrearsQuery'
import { apiConfig } from '@/config/api'
import { ENDPOINTS } from '@/constants/endpoints'
import { downloadCsv } from '@/lib/downloadCsv'

type Props = {
  unit: any
  propertyId?: string
  onClose?: () => void
}

export function UnitPaymentsPanel({ unit, propertyId, onClose }: Props) {
  const payments = (unit as any).payments ?? []

  const totalPaid = payments.reduce(
    (s: number, p: any) => s + (p.amount ?? 0),
    0
  )
  const monthly = unit.currentLeaseAmount ?? 0
  const balance = (unit as any).balance ?? monthly - totalPaid

  // Current lease for ledger
  const { data: leases = [] } = useUnitLeasesQuery(propertyId ?? '', unit.id ?? '')
  const currentLeaseId = React.useMemo(() => {
    if (!Array.isArray(leases)) return undefined
    const active = (leases as any).find((l: any) => (l.status ?? '').toLowerCase() === 'active')
    return (active ?? (leases as any)[0])?.id
  }, [leases])
  const { data: ledger } = useLeaseLedgerQuery(currentLeaseId)

  // Reports state
  const [month, setMonth] = React.useState<string>(() => new Date().toISOString().slice(0, 7))
  const [asOf, setAsOf] = React.useState<string>(() => new Date().toISOString().slice(0, 10))
  const { data: rentRoll = [] } = useRentRollQuery(propertyId, month)
  const { data: arrears } = useArrearsQuery(propertyId, asOf)

  const base = apiConfig.baseUrl?.replace(/\/$/, '')
  function build(endpointKey: string, pathParams: Record<string, string>, q?: Record<string, string | number | undefined>) {
    // Simple path builder to avoid pulling ApiClient internals
    let path = apiConfig.endpoints[endpointKey as any] || endpointKey
    Object.entries(pathParams).forEach(([k, v]) => {
      path = path.replace(`:${k}`, encodeURIComponent(String(v)))
    })
    if (q) {
      const qs = Object.entries(q)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v!))}`)
        .join('&')
      if (qs) path += (path.includes('?') ? '&' : '?') + qs
    }
    return `${base}${path}`
  }

  return (
    <div className='flex min-h-[60vh] flex-col gap-4'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <CreditCard className='h-4 w-4' />
          <span className='text-sm font-medium'>
            Payments • Unit #{unit.unitIdentifier}
          </span>
          <Badge variant='secondary'>
            Balance: KES {balance.toLocaleString('en-KE')}
          </Badge>
        </div>
        <Button
          size='sm'
          onClick={() => {
            /* open record payment modal */
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Record Payment
        </Button>
      </div>

      <Separator />

      {/* Reports actions */}
      <div className='rounded-md border p-3'>
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          <TableIcon className='h-4 w-4' />
          <div className='text-sm font-medium'>Reports</div>
        </div>
        <div className='grid gap-3 md:grid-cols-2'>
          {/* Rent roll */}
          <div className='rounded-md border p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <div className='text-sm font-medium'>Rent Roll</div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={!propertyId}
                  onClick={() => propertyId && downloadCsv(
                    build(ENDPOINTS.RENT_ROLL_CSV, { propertyId }, { month }),
                    `rent-roll-${propertyId}-${month}.csv`
                  )}
                >
                  <FileDown className='mr-2 h-4 w-4' /> Export CSV
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={!propertyId}
                  onClick={() => propertyId && downloadCsv(
                    build(ENDPOINTS.RENT_ROLL_TAX_CSV, { propertyId }, { month, multiplier: 0.4 }),
                    `rent-roll-tax-${propertyId}-${month}.csv`
                  )}
                >
                  <FileDown className='mr-2 h-4 w-4' /> Export Tax CSV
                </Button>
              </div>
            </div>
            <div className='mb-2 flex items-center gap-2'>
              <div className='text-xs text-muted-foreground'>Month</div>
              <Input type='month' value={month} onChange={(e) => setMonth(e.target.value)} className='h-8 w-[160px]' />
            </div>
            <div className='max-h-48 overflow-auto rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lease</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead className='text-right'>Due</TableHead>
                    <TableHead className='text-right'>Paid</TableHead>
                    <TableHead className='text-right'>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentRoll.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-muted-foreground text-xs'>No data.</TableCell>
                    </TableRow>
                  ) : (
                    rentRoll.map((r) => (
                      <TableRow key={`${r.leaseId}-${r.unitId}`}>
                        <TableCell className='text-xs'>{r.leaseId.slice(0, 8)}…</TableCell>
                        <TableCell className='text-xs'>{r.unitId.slice(0, 8)}…</TableCell>
                        <TableCell className='text-xs'>{r.tenantId.slice(0, 8)}…</TableCell>
                        <TableCell className='text-right text-xs'>{r.due.toLocaleString('en-KE')}</TableCell>
                        <TableCell className='text-right text-xs'>{r.paid.toLocaleString('en-KE')}</TableCell>
                        <TableCell className='text-right text-xs'>{r.balance.toLocaleString('en-KE')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Arrears */}
          <div className='rounded-md border p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <div className='text-sm font-medium'>Arrears</div>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={!propertyId}
                  onClick={() => propertyId && downloadCsv(
                    build(ENDPOINTS.ARREARS_CSV, { propertyId }, { asOf }),
                    `arrears-${propertyId}-${asOf}.csv`
                  )}
                >
                  <FileDown className='mr-2 h-4 w-4' /> Export CSV
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={!propertyId}
                  onClick={() => propertyId && downloadCsv(
                    build(ENDPOINTS.ARREARS_TAX_CSV, { propertyId }, { asOf, multiplier: 0.4 }),
                    `arrears-tax-${propertyId}-${asOf}.csv`
                  )}
                >
                  <FileDown className='mr-2 h-4 w-4' /> Export Tax CSV
                </Button>
              </div>
            </div>
            <div className='mb-2 flex items-center gap-2'>
              <div className='text-xs text-muted-foreground'>As of</div>
              <Input type='date' value={asOf} onChange={(e) => setAsOf(e.target.value)} className='h-8 w-[160px]' />
            </div>
            <div className='text-xs'>
              <div className='mb-2 grid grid-cols-4 gap-2'>
                <Badge variant='outline'>0-30: {(arrears?.summary?.['0-30'] ?? 0).toLocaleString('en-KE')}</Badge>
                <Badge variant='outline'>31-60: {(arrears?.summary?.['31-60'] ?? 0).toLocaleString('en-KE')}</Badge>
                <Badge variant='outline'>61-90: {(arrears?.summary?.['61-90'] ?? 0).toLocaleString('en-KE')}</Badge>
                <Badge variant='outline'>90+: {(arrears?.summary?.['90+'] ?? 0).toLocaleString('en-KE')}</Badge>
              </div>
              <div className='max-h-40 overflow-auto rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lease</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead className='text-right'>Outstanding</TableHead>
                      <TableHead className='text-right'>Max Days Past Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrears?.rows?.length ? (
                      arrears.rows.map((r) => (
                        <TableRow key={`${r.leaseId}-${r.unitId}`}>
                          <TableCell className='text-xs'>{r.leaseId.slice(0, 8)}…</TableCell>
                          <TableCell className='text-xs'>{r.unitId.slice(0, 8)}…</TableCell>
                          <TableCell className='text-xs'>{r.tenantId.slice(0, 8)}…</TableCell>
                          <TableCell className='text-right text-xs'>{r.outstanding.toLocaleString('en-KE')}</TableCell>
                          <TableCell className='text-right text-xs'>{r.maxDaysPastDue}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className='text-muted-foreground text-xs'>No data.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lease ledger */}
      <div className='rounded-md border p-3'>
        <div className='mb-2 flex items-center gap-2'>
          <ListOrdered className='h-4 w-4' />
          <div className='text-sm font-medium'>Lease Ledger</div>
          <div className='text-xs text-muted-foreground'>
            {currentLeaseId ? `Lease ${currentLeaseId.slice(0, 8)}…` : 'No lease'}
          </div>
        </div>
        <div className='max-h-56 overflow-auto rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead className='text-right'>Amount Due</TableHead>
                <TableHead className='text-right'>Amount Paid</TableHead>
                <TableHead className='text-right'>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledger?.periods?.length ? (
                ledger.periods.map((p) => (
                  <TableRow key={p.dueDate}>
                    <TableCell className='text-xs'>
                      {new Date(p.dueDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className='text-right text-xs'>{p.amountDue.toLocaleString('en-KE')}</TableCell>
                    <TableCell className='text-right text-xs'>{p.amountPaid.toLocaleString('en-KE')}</TableCell>
                    <TableCell className='text-right text-xs'>{p.balance.toLocaleString('en-KE')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground text-xs'>No ledger available.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className='mt-2 flex justify-end'>
        <Button variant='ghost' onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
