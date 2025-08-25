'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Property } from '../types'

type PropertyRailProps = {
  items: Property[]
  selectedId: string | null
  onSelect: (id: string) => void
  fillHeight?: boolean
}

const safeLower = (v?: string | null) => (v ?? '').toLowerCase()

function displayType(v?: string | null) {
  const t = (v ?? '').trim()
  if (!t) return 'Unknown'
  return t.slice(0, 1).toUpperCase() + t.slice(1)
}

export const PropertyRail = React.memo(function PropertyRail({
  items,
  selectedId,
  onSelect,
  fillHeight,
}: PropertyRailProps) {
  const [search, setSearch] = React.useState('')
  const deferredSearch = React.useDeferredValue(search)

  const filtered = React.useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    if (!term) return items
    return items.filter((p) => {
      const name = safeLower(p.name)
      const address = safeLower((p as any).address ?? (p as any).fullAddress)
      const pType = safeLower(p.propertyType ?? (p as any).type)
      return (
        name.includes(term) || address.includes(term) || pType.includes(term)
      )
    })
  }, [deferredSearch, items])

  return (
    <div
      className={['flex flex-col', fillHeight ? 'h-full min-h-0' : ''].join(
        ' '
      )}
    >
      <div className='bg-background/70 sticky top-0 z-10 border-b p-3 backdrop-blur'>
        <div className='flex items-center gap-2'>
          <Search className='text-muted-foreground h-4 w-4' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search properties...'
            className='h-8'
            aria-label='Search properties'
          />
        </div>
      </div>

      <div className='mt-3 flex-1 overflow-auto p-2'>
        {filtered.length === 0 ? (
          <div className='text-muted-foreground px-2 py-6 text-xs'>
            No properties match “{search}”.
          </div>
        ) : (
          <div
            className='flex flex-col gap-3'
            role='listbox'
            aria-label='Property list'
            aria-activedescendant={selectedId ?? undefined}
          >
            {filtered.map((p) => {
              // Normalize units (may be missing with lean API responses)
              const units = Array.isArray((p as any).units)
                ? (p as any).units
                : []

              // Fallback counts if no units array provided
              const fallbackTotal =
                Number(
                  (p as any).unitsCount ?? (p as any).summary?.unitsCount ?? 0
                ) || 0
              const fallbackOccupied =
                Number(
                  (p as any).occupiedUnits ??
                    (p as any).summary?.occupiedUnits ??
                    0
                ) || 0

              const totalUnits = units.length > 0 ? units.length : fallbackTotal
              const occupiedUnits =
                units.length > 0
                  ? units.filter((u: any) => u?.status === 'Occupied').length
                  : Math.min(fallbackOccupied, totalUnits)

              const occupancy =
                totalUnits > 0
                  ? Math.round((occupiedUnits / totalUnits) * 100)
                  : 0
              const isActive = selectedId === p.id

              const address =
                ((p as any).address ??
                  (p as any).fullAddress ??
                  [(p as any).addressLine1, (p as any).city, (p as any).country]
                    .filter(Boolean)
                    .join(', ')) ||
                '—'

              const propertyType = displayType(
                p.propertyType ?? (p as any).type
              )

              return (
                <div
                  key={p.id}
                  id={p.id}
                  role='option'
                  aria-selected={isActive}
                >
                  <button
                    type='button'
                    onClick={() => onSelect(p.id)}
                    className='w-full text-left'
                  >
                    <Card
                      className={[
                        'group bg-card relative rounded-md border transition-all',
                        'hover:bg-muted/70 hover:shadow-md',
                        isActive ? 'ring-primary/50 shadow-md ring-2' : '',
                      ].join(' ')}
                    >
                      <div className='px-4'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <div
                              className='truncate text-sm leading-tight font-semibold'
                              title={p.name}
                            >
                              {p.name}
                            </div>
                            <div
                              className='text-muted-foreground mt-0.5 truncate text-xs'
                              title={address}
                            >
                              {address}
                            </div>
                          </div>
                          <Badge
                            variant='secondary'
                            className='h-6 shrink-0 rounded-full px-2 text-xs'
                            title={propertyType}
                          >
                            {propertyType}
                          </Badge>
                        </div>

                        <div className='mt-2 space-y-1'>
                          <div
                            className='bg-muted h-1.5 w-full overflow-hidden rounded-md'
                            aria-label={`Occupancy ${occupancy}%`}
                          >
                            <div
                              className='bg-primary h-1.5 rounded-md transition-all'
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                          <div className='text-muted-foreground flex items-center justify-between text-[11px]'>
                            <span>
                              {occupiedUnits}/{totalUnits} units
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
})
