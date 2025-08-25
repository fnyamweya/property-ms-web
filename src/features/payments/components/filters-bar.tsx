'use client'

import { useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import type {
  PaymentMethod,
  PaymentStatus,
  PaymentDirection,
  PaymentsQuery,
} from '../types'

type Props = {
  value: PaymentsQuery
  onChange: (q: PaymentsQuery) => void
  propertyOptions?: { id: string; name: string }[]
}

export function FiltersBar({ value, onChange, propertyOptions = [] }: Props) {
  const statusOpts: (PaymentStatus | 'All')[] = [
    'All',
    'Completed',
    'Pending',
    'Failed',
    'Refunded',
  ]
  const methodOpts: (PaymentMethod | 'All')[] = [
    'All',
    'Mpesa',
    'Card',
    'Bank',
    'Cash',
  ]
  const dirOpts: (PaymentDirection | 'All')[] = ['All', 'Incoming', 'Outgoing']

  const activeFilters = useMemo(() => {
    const tags: string[] = []
    if (value.status && value.status !== 'All')
      tags.push(`Status: ${value.status}`)
    if (value.method && value.method !== 'All')
      tags.push(`Method: ${value.method}`)
    if (value.direction && value.direction !== 'All')
      tags.push(`Flow: ${value.direction}`)
    if (value.propertyId && value.propertyId !== 'All') {
      const name =
        propertyOptions.find((p) => p.id === value.propertyId)?.name ??
        value.propertyId
      tags.push(`Property: ${name}`)
    }
    if (value.dateFrom)
      tags.push(`From: ${value.dateFrom.toLocaleDateString()}`)
    if (value.dateTo) tags.push(`To: ${value.dateTo.toLocaleDateString()}`)
    return tags
  }, [value, propertyOptions])

  return (
    <div className='flex flex-col gap-3 rounded-lg border p-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative'>
          <Search className='pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 opacity-50' />
          <Input
            placeholder='Search tenant, reference, unit...'
            className='w-[260px] pl-8'
            value={value.q ?? ''}
            onChange={(e) => onChange({ ...value, q: e.target.value, page: 1 })}
          />
        </div>

        <Select
          value={value.status ?? 'All'}
          onValueChange={(v) =>
            onChange({ ...value, status: v as any, page: 1 })
          }
        >
          <SelectTrigger className='w-[150px]'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            {statusOpts.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.method ?? 'All'}
          onValueChange={(v) =>
            onChange({ ...value, method: v as any, page: 1 })
          }
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Method' />
          </SelectTrigger>
          <SelectContent>
            {methodOpts.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.direction ?? 'All'}
          onValueChange={(v) =>
            onChange({ ...value, direction: v as any, page: 1 })
          }
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Flow' />
          </SelectTrigger>
          <SelectContent>
            {dirOpts.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.propertyId ?? 'All'}
          onValueChange={(v) =>
            onChange({ ...value, propertyId: v as any, page: 1 })
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Property' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='All'>All</SelectItem>
            {propertyOptions.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm'>
              <SlidersHorizontal className='mr-2 h-4 w-4' />
              Date range
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-3'>
            <div className='flex gap-3'>
              <div className='text-muted-foreground text-xs'>From</div>
              <Calendar
                mode='single'
                selected={value.dateFrom ?? undefined}
                onSelect={(d) =>
                  onChange({ ...value, dateFrom: d ?? null, page: 1 })
                }
              />
              <div className='text-muted-foreground text-xs'>To</div>
              <Calendar
                mode='single'
                selected={value.dateTo ?? undefined}
                onSelect={(d) =>
                  onChange({ ...value, dateTo: d ?? null, page: 1 })
                }
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className='ml-auto'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() =>
              onChange({
                q: '',
                status: 'All',
                method: 'All',
                direction: 'All',
                propertyId: 'All',
                dateFrom: null,
                dateTo: null,
                page: 1,
                pageSize: value.pageSize ?? 10,
              })
            }
          >
            Reset
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {activeFilters.map((t) => (
            <Badge key={t} variant='outline'>
              {t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
