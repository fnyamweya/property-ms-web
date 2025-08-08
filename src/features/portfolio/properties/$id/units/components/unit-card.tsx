'use client'

import type { ReactNode } from 'react'
import { Home, Briefcase, User, Ruler, CalendarClock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import type { Unit } from '../../../types'

const leaseIcons: Record<string, ReactNode> = {
  'Residential Rent': <Home className='h-4 w-4' />,
  'Commercial Lease': <Briefcase className='h-4 w-4' />,
  'Owner Occupied': <Home className='h-4 w-4' />,
}

const statusPill: Record<Unit['status'], string> = {
  Vacant:
    'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950',
  'Under Maintenance':
    'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950',
  Occupied:
    'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950',
}

export function UnitCard({
  unit,
  onClick,
}: {
  unit: Unit
  onClick: () => void
}) {
  const isVacant = unit.status === 'Vacant'
  const leaseEnds =
    unit.leaseEndDate &&
    unit.leaseEndDate.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <Card
      role='button'
      tabIndex={0}
      onClick={onClick}
      aria-label={`Open ${unit.unitIdentifier} details`}
      className={[
        'group bg-card @container/card h-full cursor-pointer rounded-lg border text-left shadow-sm transition-all',
        'hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      ].join(' ')}
    >
      {/* Header: flex + wrap so pill never gets clipped */}
      <CardHeader className='flex flex-wrap items-start justify-between gap-2 px-4 pt-4 pb-2'>
        <div className='min-w-0'>
          <CardTitle className='truncate text-sm leading-tight font-semibold @[360px]/card:text-base'>
            {unit.unitIdentifier}
          </CardTitle>
          <CardDescription className='mt-1 flex items-center gap-1.5 text-xs @[360px]/card:text-sm'>
            {leaseIcons[unit.leaseType] ?? leaseIcons['Owner Occupied']}
            <span className='truncate'>{unit.leaseType}</span>
          </CardDescription>
        </div>

        {/* Status pill (no clipping) */}
        <Badge
          variant='outline'
          className={[
            'ml-auto shrink-0 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap @[360px]/card:text-xs',
            statusPill[unit.status],
          ].join(' ')}
        >
          {unit.status}
        </Badge>
      </CardHeader>

      {/* Info list with neutral separators */}
      <div className='border-muted/30 mx-4 rounded-md border'>
        <div className='flex items-center gap-2 px-3 py-2 text-xs @[360px]/card:text-sm'>
          <User className='h-3.5 w-3.5 shrink-0 @[360px]/card:h-4 @[360px]/card:w-4' />
          <span className='truncate'>
            {unit.tenantName ? (
              unit.tenantName
            ) : (
              <span className='italic'>Vacant</span>
            )}
          </span>
        </div>

        <div className='bg-muted/30 h-px w-full' />

        <div className='flex items-center gap-2 px-3 py-2 text-xs @[360px]/card:text-sm'>
          <Ruler className='h-3.5 w-3.5 shrink-0 @[360px]/card:h-4 @[360px]/card:w-4' />
          <span>{unit.squareFootage.toLocaleString()} sq ft</span>
        </div>

        {leaseEnds && (
          <>
            <div className='bg-muted/30 h-px w-full' />
            <div className='flex items-center gap-2 px-3 py-2 text-xs @[360px]/card:text-sm'>
              <CalendarClock className='h-3.5 w-3.5 shrink-0 @[360px]/card:h-4 @[360px]/card:w-4' />
              <span>Ends {leaseEnds}</span>
            </div>
          </>
        )}

        <div className='bg-muted/30 h-px w-full' />

        <div className='flex flex-col gap-1 px-3 py-2 @[420px]/card:flex-row @[420px]/card:items-center @[420px]/card:justify-between'>
          <span className='text-muted-foreground text-xs @[360px]/card:text-sm'>
            {isVacant ? 'Asking Rent' : 'Monthly Rent'}
          </span>
          <span className='text-sm font-semibold tracking-tight @[360px]/card:text-base'>
            {formatCurrency(unit.currentLeaseAmount, unit.currency)}
            <span className='text-muted-foreground ml-1 text-[11px]'>/mo</span>
          </span>
        </div>
      </div>

      <CardFooter className='flex-col items-stretch gap-2 px-4 pt-3 pb-4'>
        {isVacant ? (
          <Button
            variant='secondary'
            size='sm'
            className='w-full'
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            Assign Tenant
          </Button>
        ) : (
          <div className='text-muted-foreground text-[11px] @[360px]/card:text-xs'>
            Tip: Click card to view full lease details
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
