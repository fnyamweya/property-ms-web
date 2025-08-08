'use client'

import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Wrench,
  Users,
  FileText,
  Building,
  LayoutDashboard,
  Edit,
  User,
  Archive,
  CalendarClock,
  Circle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RadialProgress } from '@/components/ui/radial-progress'
import { StackedProgressBar } from '@/components/ui/stacked-progress-bar'
import type { Property } from '../types'

const propertyTypeColors = {
  Residential:
    'border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-400',
  Commercial:
    'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400',
  'Mixed-Use':
    'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-400',
  Industrial:
    'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400',
}

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate()
  const stats = useMemo(() => {
    const totalUnits = property.units.length
    if (totalUnits === 0) {
      return {
        totalUnits: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
        maintenanceUnits: 0,
        occupancyPercentage: 0,
        totalIncome: 0,
        upcomingRenewals: [],
      }
    }

    const occupiedUnits = property.units.filter(
      (u) => u.status === 'Occupied'
    ).length
    const vacantUnits = property.units.filter(
      (u) => u.status === 'Vacant'
    ).length
    const maintenanceUnits = property.units.filter(
      (u) => u.status === 'Under Maintenance'
    ).length

    const occupancyPercentage = Math.round((occupiedUnits / totalUnits) * 100)
    const totalIncome = property.units.reduce(
      (sum, unit) => sum + unit.currentLeaseAmount,
      0
    )

    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
    const upcomingRenewals = property.units.filter(
      (u) => u.leaseEndDate && u.leaseEndDate <= ninetyDaysFromNow
    )

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyPercentage,
      totalIncome,
      upcomingRenewals,
    }
  }, [property.units])

  return (
    <Card className='group bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md'>
      <CardHeader>
        <div className='flex items-center justify-between gap-3'>
          <RadialProgress
            value={stats.occupancyPercentage}
            size={45}
            strokeWidth={3}
          />
          <div className='flex-1'>
            <CardTitle className='text-sm'>{property.name}</CardTitle>
            <CardDescription className='text-xs'>
              {property.address}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 flex-shrink-0'
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Property Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LayoutDashboard className='mr-2 h-4 w-4' />
                <span>View Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className='mr-2 h-4 w-4' />
                <span>Edit Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className='mr-2 h-4 w-4' />
                <span>Manage Staff</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='font-semibold text-red-500 focus:bg-red-50 focus:text-red-600'>
                <Archive className='mr-2 h-4 w-4' />
                <span>Archive Property</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='flex flex-grow flex-col'>
        <div className='relative mb-4 aspect-[16/10] w-full overflow-hidden rounded'>
          <img
            src={property.imageUrl}
            alt={`Image of ${property.name}`}
            className='absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
          {/* --- REMOVED: Radial progress bar is no longer here --- */}
          <div className='absolute right-2 bottom-2'>
            <Badge className={propertyTypeColors[property.propertyType]}>
              {property.propertyType}
            </Badge>
          </div>
        </div>

        <div className='mb-4'>
          <StackedProgressBar
            segments={[
              {
                value: stats.occupiedUnits,
                color: 'bg-blue-600',
                label: 'Occupied',
              },
              {
                value: stats.vacantUnits,
                color: 'bg-blue-400',
                label: 'Vacant',
              },
              {
                value: stats.maintenanceUnits,
                color: 'bg-blue-200',
                label: 'Maintenance',
              },
            ]}
          />
          <div className='text-muted-foreground mt-2 grid grid-cols-3 gap-1 text-xs'>
            <div className='flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-full bg-blue-600'></span>
              <span>Occ ({stats.occupiedUnits})</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-full bg-blue-400'></span>
              <span>Vac ({stats.vacantUnits})</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-2 w-2 rounded-full bg-blue-200'></span>
              <span>Maint. ({stats.maintenanceUnits})</span>
            </div>
          </div>
        </div>

        {stats.upcomingRenewals.length > 0 && (
          <div className='bg-muted/50 mb-4 rounded-lg border p-3'>
            <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-500'>
              <CalendarClock className='h-5 w-5' />
              <span>Upcoming Lease Renewals</span>
            </div>
            <div className='space-y-1 text-xs'>
              {stats.upcomingRenewals.map((unit) => (
                <div key={unit.id} className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Unit {unit.unitIdentifier}
                  </span>
                  <span className='font-medium'>
                    {unit.leaseEndDate?.toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className='mt-auto grid grid-cols-3 gap-2 pt-4 text-center'>
          <Button
            variant='outline'
            size='sm'
            className='flex h-auto flex-col p-2'
          >
            <FileText className='h-5 w-5' />
            <span className='mt-1 text-xs'>Accounting</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex h-auto flex-col p-2'
          >
            <Users className='h-5 w-5' />
            <span className='mt-1 text-xs'>Tenants</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='relative flex h-auto flex-col p-2'
          >
            {property.mrRequestCounts.open > 0 && (
              <span className='absolute -top-1 -right-1 flex h-4 w-4'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white'>
                  {property.mrRequestCounts.open}
                </span>
              </span>
            )}
            <Wrench className='h-5 w-5' />
            <span className='mt-1 text-xs'>MR Requests</span>
          </Button>
        </div>
      </CardContent>

      <CardFooter className='bg-muted/20 flex-col items-start gap-2 border-t p-4'>
        <Button size='sm' className='mt-2 w-full'>
          <Building className='mr-2 h-4 w-4' />
          Manage Property
        </Button>

        <Button
          size='sm'
          variant='outline'
          className='w-full'
          onClick={() =>
            navigate({
              to: '/properties/$id/units',
              params: { id: property.id },
            })
          }
        >
          <LayoutDashboard className='mr-2 h-4 w-4' />
          View Units
        </Button>
      </CardFooter>
    </Card>
  )
}
