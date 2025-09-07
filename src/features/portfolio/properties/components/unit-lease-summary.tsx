"use client"

import * as React from 'react'
import { useUnitLeases } from '@/hooks/useUnitLeases'

export function UnitLeaseSummary({ pid, uid }: { pid: string; uid: string }) {
  const { current, status } = useUnitLeases(pid, uid)

  if (status === 'loading') {
    return <div className='text-xs text-muted-foreground'>Loading lease…</div>
  }
  if (!current) {
    return <div className='text-xs text-muted-foreground'>No lease info</div>
  }
  const amount = current.amount ?? (current as any)?.rentAmount
  const currency = current.currency ?? (current as any)?.currency ?? 'KES'
  const frequency = current.frequency ?? (current as any)?.frequency ?? 'mo'
  const end = current.endDate ? new Date(current.endDate) : undefined
  const charges: any[] = Array.isArray(current.charges) ? current.charges : []

  return (
    <div className='rounded-md border p-3'>
      <div className='text-[11px] uppercase tracking-wide text-muted-foreground mb-1'>Lease</div>
      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
        <KV k='Type' v={current.type ?? (current as any)?.leaseType ?? '—'} />
        <KV k='Rent' v={`${currency} ${Number(amount ?? 0).toLocaleString('en-KE')} / ${frequency}`} />
        <KV k='Lease End' v={end ? end.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} />
      </div>
      <div className='mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        <KV k='Next Due' v={ (current as any)?.nextDueDate ? new Date((current as any).nextDueDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No upcoming due' } />
      </div>
      {charges.length > 0 && (
        <div className='mt-2'>
          <div className='text-[11px] uppercase tracking-wide text-muted-foreground mb-1'>Charges</div>
          <ul className='text-sm list-disc pl-5'>
            {charges.map((c: any, i: number) => (
              <li key={i}>
                {(c.name ?? c.type ?? 'Charge')}: {c.currency ?? currency} {Number(c.amount ?? 0).toLocaleString('en-KE')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function KV({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div>
      <div className='text-[11px] uppercase tracking-wide text-muted-foreground'>{k}</div>
      <div className='text-sm font-medium'>{v}</div>
    </div>
  )
}
