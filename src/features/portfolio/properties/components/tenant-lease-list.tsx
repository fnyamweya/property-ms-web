"use client"
import { useTenantLeases } from '@/hooks/useTenantLeases'

export function TenantLeaseList({ tenantId, organizationId }: { tenantId: string; organizationId?: string }) {
  const { leases, status } = useTenantLeases(tenantId, organizationId)

  if (!tenantId) return null
  if (status === 'loading') return <div className='text-xs text-muted-foreground'>Loading tenant leases…</div>
  if (!leases.length) return <div className='text-xs text-muted-foreground'>No tenant leases</div>

  return (
    <div className='rounded-md border p-3'>
      <div className='text-[11px] uppercase tracking-wide text-muted-foreground mb-1'>Tenant Leases</div>
      <div className='grid gap-2'>
        {leases.map((l) => {
          const amount = l.amount ?? (l as any)?.rentAmount
          const currency = l.currency ?? (l as any)?.currency ?? 'KES'
          const frequency = l.frequency ?? (l as any)?.frequency ?? 'mo'
          const end = l.endDate ? new Date(l.endDate) : undefined
          return (
            <div key={l.id} className='rounded-sm border p-2'>
              <div className='text-sm font-medium'>{l.type ?? (l as any)?.leaseType ?? 'Lease'}</div>
              <div className='text-xs text-muted-foreground'>
                {l.property?.name ?? '—'} • {l.unit?.unitNumber ?? l.unit?.name ?? '—'}
              </div>
              <div className='text-sm'>
                {currency} {Number(amount ?? 0).toLocaleString('en-KE')} / {frequency}
              </div>
              <div className='text-xs text-muted-foreground'>
                End: {end ? end.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
