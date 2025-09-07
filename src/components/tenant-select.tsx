"use client"

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/lib/use-debounce'
import { useTenantsMyOrgsQuery } from '@/hooks/queries/useTenantsMyOrgsQuery'

export function TenantSelect({ value, onChange, organizationId }: { value?: string; onChange: (id?: string) => void; organizationId?: string }) {
  const [q, setQ] = React.useState('')
  const dq = useDebounce(q, 300)
  const { data: tenants = [], isLoading } = useTenantsMyOrgsQuery(dq, organizationId)

  return (
    <div className='space-y-2'>
      <Input placeholder='Search tenant by name, email, phone' value={q} onChange={(e) => setQ(e.target.value)} />
      <div className='max-h-48 overflow-auto rounded border'>
        {isLoading ? (
          <div className='p-2 text-xs text-muted-foreground'>Loading…</div>
        ) : tenants.length === 0 ? (
          <div className='p-2 text-xs text-muted-foreground'>No tenants found</div>
        ) : (
          tenants.map((t) => (
            <button
              type='button'
              key={t.id}
              className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent ${value === t.id ? 'bg-accent' : ''}`}
              onClick={() => onChange(t.id)}
            >
              <span className='text-sm'>{t.name ?? t.email ?? t.phone ?? t.id}</span>
              {value === t.id && <span className='text-[10px] text-muted-foreground'>Selected</span>}
            </button>
          ))
        )}
      </div>
      {value && (
        <div className='text-[11px] text-muted-foreground'>Selected: {value}</div>
      )}
    </div>
  )
}
