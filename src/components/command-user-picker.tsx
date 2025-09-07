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
import { useUsersSearchQuery } from '@/hooks/queries/useUsersSearchQuery'

export type UserOption = { id: string; firstName?: string; lastName?: string; email?: string; phone?: string }

export function CommandUserPicker({
  value,
  selectedUser,
  onSelect,
  placeholder = 'Search user (⌘K)',
}: {
  value?: string
  selectedUser?: UserOption
  onSelect: (user?: UserOption) => void
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const dq = useDebounce(q, 250)
  const { data: users = [], isLoading } = useUsersSearchQuery(dq)

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

  function labelOf(u: UserOption) {
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
    return name || u.email || u.phone || u.id
  }

  function maskPhone(phone?: string) {
    if (!phone) return undefined
    const s = String(phone)
    if (s.length <= 3) return '***'
    return s.slice(0, -3) + '***'
  }

  function subLabelOf(u: UserOption) {
    const masked = maskPhone(u.phone)
    const parts = [u.email, masked].filter(Boolean)
    return parts.join(' • ')
  }

  return (
    <div className='flex gap-2'>
      <Button type='button' variant='outline' className='w-full justify-start' onClick={() => setOpen(true)}>
        <span className='truncate text-sm'>{selectedUser ? labelOf(selectedUser) : placeholder}</span>
      </Button>
      <Button type='button' variant='secondary' onClick={() => onSelect(undefined)} disabled={!value}>
        Clear
      </Button>
      <CommandDialog modal open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder='Type a name, email or phone…' value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>{isLoading ? 'Loading…' : 'No users found'}</CommandEmpty>
            <CommandGroup heading='Results'>
              {users.map((u) => (
                <CommandItem key={u.id} value={u.id} onSelect={() => { onSelect(u); setOpen(false) }}>
                  <div className='flex flex-col'>
                    <span className='text-sm'>{labelOf(u)}</span>
                    <span className='text-[11px] text-muted-foreground'>{subLabelOf(u)}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            {!!value && (
              <CommandGroup heading='Selected'>
                <CommandItem value='selected'>
                  <div className='text-sm'>Selected user: {value}</div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
