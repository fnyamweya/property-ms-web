'use client'

import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ChevronLeft,
  PlusCircle,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { properties } from '../../data'
import type { Property, Unit } from '../../types'
import { UnitCard } from './components/unit-card'

type Props = { propertyId: string }

const getPropertyById = (id: string): Property | undefined =>
  properties.find((p) => p.id === id)

const STATUS_PRIORITY: Record<Unit['status'], number> = {
  Vacant: 0,
  'Under Maintenance': 1,
  Occupied: 2,
}

export function PropertyUnits({ propertyId }: Props) {
  const navigate = useNavigate()

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | Unit['status']>(
    'All'
  )
  const [sortBy, setSortBy] = useState<
    | 'identifier-asc'
    | 'identifier-desc'
    | 'rent-desc'
    | 'rent-asc'
    | 'lease-end-asc'
  >('identifier-asc')

  const property = useMemo(() => getPropertyById(propertyId), [propertyId])

  const filteredAndSortedUnits = useMemo(() => {
    if (!property) return []

    const s = searchTerm.toLowerCase()

    const filtered = property.units.filter((u) => {
      const searchMatch =
        u.unitIdentifier.toLowerCase().includes(s) ||
        u.tenantName?.toLowerCase().includes(s)

      const statusMatch = statusFilter === 'All' || u.status === statusFilter

      return searchMatch && statusMatch
    })

    // Primary sort: vacancy-first; Secondary: user-selected sort
    const cmpSecondary = (a: Unit, b: Unit) => {
      switch (sortBy) {
        case 'identifier-asc':
          return a.unitIdentifier.localeCompare(b.unitIdentifier)
        case 'identifier-desc':
          return b.unitIdentifier.localeCompare(a.unitIdentifier)
        case 'rent-desc':
          return b.currentLeaseAmount - a.currentLeaseAmount
        case 'rent-asc':
          return a.currentLeaseAmount - b.currentLeaseAmount
        case 'lease-end-asc':
          return (
            (a.leaseEndDate?.getTime() || 0) - (b.leaseEndDate?.getTime() || 0)
          )
        default:
          return 0
      }
    }

    return [...filtered].sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status]
      const pb = STATUS_PRIORITY[b.status]
      if (pa !== pb) return pa - pb
      return cmpSecondary(a, b)
    })
  }, [property, searchTerm, statusFilter, sortBy])

  if (!property) {
    return (
      <div className='p-8 text-center'>
        <h2 className='text-xl font-semibold'>Property not found.</h2>
        <Button
          variant='link'
          className='mt-2'
          onClick={() => navigate({ to: '/properties' })}
        >
          Return to portfolio
        </Button>
      </div>
    )
  }

  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <div className='flex flex-1 flex-col gap-6 p-4 md:p-8'>
        {/* Header */}
        <header className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate({ to: '/properties' })}
            >
              <ChevronLeft className='mr-2 h-4 w-4' />
              Back to Portfolio
            </Button>
            <h1 className='mt-2 text-3xl font-bold tracking-tight'>
              {property.name} Units
            </h1>
            <p className='text-muted-foreground'>{property.address}</p>
          </div>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' />
            Add New Unit
          </Button>
        </header>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <SlidersHorizontal className='h-5 w-5' />
              Filter &amp; Sort Units
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col flex-wrap gap-4 md:flex-row'>
            {/* Search */}
            <div className='relative min-w-[220px] flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search unit or tenant…'
                className='w-full pl-10'
              />
            </div>

            {/* Status */}
            <div className='min-w-[160px] flex-1'>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='All'>All Statuses</SelectItem>
                  <SelectItem value='Occupied'>Occupied</SelectItem>
                  <SelectItem value='Vacant'>Vacant</SelectItem>
                  <SelectItem value='Under Maintenance'>
                    Under Maintenance
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort (secondary within status groups) */}
            <div className='min-w-[160px] flex-1'>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as typeof sortBy)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='identifier-asc'>Unit ID (A–Z)</SelectItem>
                  <SelectItem value='identifier-desc'>Unit ID (Z–A)</SelectItem>
                  <SelectItem value='rent-desc'>Rent (High–Low)</SelectItem>
                  <SelectItem value='rent-asc'>Rent (Low–High)</SelectItem>
                  <SelectItem value='lease-end-asc'>
                    Lease Ends (Soonest)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Count */}
        <div className='text-muted-foreground text-sm'>
          Showing{' '}
          <span className='text-foreground font-semibold'>
            {filteredAndSortedUnits.length}
          </span>{' '}
          of{' '}
          <span className='text-foreground font-semibold'>
            {property.units.length}
          </span>{' '}
          units
        </div>

        {/* Grid */}
        {filteredAndSortedUnits.length > 0 ? (
          <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
            {filteredAndSortedUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onClick={() => setSelectedUnit(unit)}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border-2 border-dashed py-16 text-center'>
            <h3 className='text-xl font-semibold'>No Units Found</h3>
            <p className='text-muted-foreground'>
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Drawer */}
        <Drawer
          open={!!selectedUnit}
          onOpenChange={(open) => !open && setSelectedUnit(null)}
        >
          <DrawerContent>
            {selectedUnit && (
              <div className='mx-auto w-full max-w-md'>
                <DrawerHeader>
                  <DrawerTitle className='text-2xl'>
                    {selectedUnit.unitIdentifier}
                  </DrawerTitle>
                  <DrawerDescription>
                    <Badge>{selectedUnit.status}</Badge> •{' '}
                    {selectedUnit.leaseType}
                  </DrawerDescription>
                </DrawerHeader>

                <div className='p-4'>
                  <h4 className='mb-2 font-semibold'>
                    Lease &amp; Tenant Details
                  </h4>
                  <div className='space-y-1 text-sm'>
                    <p>
                      <strong>Tenant:</strong>{' '}
                      {selectedUnit.tenantName || 'N/A'}
                    </p>
                    <p>
                      <strong>Rent:</strong>{' '}
                      {formatCurrency(
                        selectedUnit.currentLeaseAmount,
                        selectedUnit.currency
                      )}
                      /mo
                    </p>
                    <p>
                      <strong>Lease Ends:</strong>{' '}
                      {selectedUnit.leaseEndDate?.toLocaleDateString('en-KE') ||
                        'N/A'}
                    </p>
                    <p>
                      <strong>Size:</strong> {selectedUnit.squareFootage} sq.
                      ft.
                    </p>
                  </div>
                </div>

                <DrawerFooter>
                  {selectedUnit.status === 'Vacant' ? (
                    <Button>Add Tenant</Button>
                  ) : (
                    <Button>View Full Lease Details</Button>
                  )}
                  <Button variant='outline'>New Maintenance Request</Button>
                  <DrawerClose asChild>
                    <Button variant='ghost'>Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}
