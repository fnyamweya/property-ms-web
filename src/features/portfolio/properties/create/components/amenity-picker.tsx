'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const AMENITIES = [
  'Parking',
  'Lift',
  'Backup Power',
  'CCTV',
  'Swimming Pool',
  'Gym',
  'Borehole',
  'Garden',
  'Fibre Internet',
  'Security 24/7',
]

export function AmenityPicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const selected = useMemo(() => new Set(value), [value])

  function toggle(a: string) {
    const next = new Set(selected)
    next.has(a) ? next.delete(a) : next.add(a)
    onChange(Array.from(next))
  }

  return (
    <div className='rounded-lg border p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Amenities</h3>
        {value?.length ? (
          <Badge variant='secondary' className='font-normal'>
            {value.length} selected
          </Badge>
        ) : null}
      </div>

      <div className='flex flex-wrap gap-2'>
        {AMENITIES.map((a) => (
          <Button
            key={a}
            type='button'
            variant={selected.has(a) ? 'default' : 'outline'}
            className={cn('h-8 rounded-full')}
            onClick={() => toggle(a)}
          >
            {a}
          </Button>
        ))}
      </div>
    </div>
  )
}
