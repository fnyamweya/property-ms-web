"use client"

import * as React from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/lib/use-debounce'
import { useTenantsMyOrgsQuery } from '@/hooks/queries/useTenantsMyOrgsQuery'

export function CommandTenantPicker({
  value,
  onChange,
  organizationId,
  onCreateTenant,
  placeholder = 'Search tenant (⌘K)',
}: {
  value?: string
  onChange: (id?: string) => void
  organizationId?: string
  onCreateTenant?: (q: string) => Promise<{ id: string; name?: string }>
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const dq = useDebounce(q, 250)
  const { data: tenants = [], isLoading } = useTenantsMyOrgsQuery(dq, organizationId)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleCreate() {
    if (!onCreateTenant || !q.trim()) return
    const res = await onCreateTenant(q.trim())
    onChange(res?.id)
    setOpen(false)
  }

  function maskPhone(phone?: string | null) {
    if (!phone) return ''
    const s = String(phone)
    if (s.length <= 3) return '***'
    return s.slice(0, -3) + '***'
  }

  return (
    <div className='flex gap-2'>
      <Button type='button' variant='outline' className='w-full justify-start' onClick={() => setOpen(true)}>
        <span className='truncate text-sm'>{value ? `Tenant selected` : placeholder}</span>
      </Button>
      <Button type='button' variant='secondary' onClick={() => onChange(undefined)} disabled={!value}>
        Clear
      </Button>
      <CommandDialog modal open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder='Type a name, email or phone…' value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Loading…' : (
                <div className='space-y-2 p-2'>
                  <div>No tenants found</div>
                  {onCreateTenant && (
                    <Button type='button' size='sm' onClick={handleCreate}>
                      Create “{q.trim() || 'New tenant'}”
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>
            <CommandGroup heading='Results'>
              {tenants.map((t) => (
                <CommandItem key={t.id} value={t.id} onSelect={() => { onChange(t.id); setOpen(false) }}>
                  <div className='flex flex-col'>
                    <span className='text-sm'>{t.name ?? t.email ?? t.phone ?? t.id}</span>
                    <span className='text-[11px] text-muted-foreground'>
                      {t.phone ? maskPhone(t.phone) : (t.email ?? '')}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {!!value && (
              <CommandGroup heading='Selected'>
                <CommandItem value='selected'>
                  <div className='text-sm'>Selected: {value}</div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
