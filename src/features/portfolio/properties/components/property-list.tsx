'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { properties } from '../data'
import type { Property } from '../types'
import { PropertyCard } from './property-card'

const getPropertyIncome = (p: Property) =>
  p.units.reduce((sum, u) => sum + u.currentLeaseAmount, 0)

const getPropertyOccupancy = (p: Property) => {
  if (p.units.length === 0) return 0
  const occupied = p.units.filter((u) => u.status === 'Occupied').length
  return (occupied / p.units.length) * 100
}

export function PropertyList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name-asc')

  const filteredAndSorted = useMemo(() => {
    const s = searchTerm.toLowerCase()

    let items = properties.filter((p) => {
      const detailMatch =
        p.name.toLowerCase().includes(s) ||
        p.address.toLowerCase().includes(s) ||
        p.units.some((u) =>
          [u.unitIdentifier, u.tenantName]
            .filter(Boolean)
            .some((t) => t!.toLowerCase().includes(s))
        )

      const statusMatch =
        statusFilter === 'All' || p.units.some((u) => u.status === statusFilter)

      const typeMatch = typeFilter === 'All' || p.propertyType === typeFilter

      return detailMatch && statusMatch && typeMatch
    })

    switch (sortBy) {
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        items.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'income-desc':
        items.sort((a, b) => getPropertyIncome(b) - getPropertyIncome(a))
        break
      case 'income-asc':
        items.sort((a, b) => getPropertyIncome(a) - getPropertyIncome(b))
        break
      case 'occupancy-desc':
        items.sort((a, b) => getPropertyOccupancy(b) - getPropertyOccupancy(a))
        break
    }

    return items
  }, [searchTerm, statusFilter, typeFilter, sortBy])

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <SlidersHorizontal className='h-5 w-5' />
            Filter &amp; Sort Properties
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className='flex flex-col flex-wrap gap-4 md:flex-row'>
            {/* Search */}
            <div className='relative min-w-[220px] flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search name, address, unit, or tenant…'
                className='w-full pl-10'
              />
            </div>

            {/* Status Filter */}
            <div className='min-w-[160px] flex-1'>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='All Statuses' />
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

            {/* Type Filter */}
            <div className='min-w-[160px] flex-1'>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='All Types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='All'>All Types</SelectItem>
                  <SelectItem value='Residential'>Residential</SelectItem>
                  <SelectItem value='Commercial'>Commercial</SelectItem>
                  <SelectItem value='Mixed-Use'>Mixed-Use</SelectItem>
                  <SelectItem value='Industrial'>Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className='min-w-[160px] flex-1'>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='name-asc'>Name (A–Z)</SelectItem>
                  <SelectItem value='name-desc'>Name (Z–A)</SelectItem>
                  <SelectItem value='income-desc'>Income (High–Low)</SelectItem>
                  <SelectItem value='income-asc'>Income (Low–High)</SelectItem>
                  <SelectItem value='occupancy-desc'>
                    Occupancy (High–Low)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='text-muted-foreground text-sm'>
        Showing{' '}
        <span className='text-foreground font-semibold'>
          {filteredAndSorted.length}
        </span>{' '}
        of{' '}
        <span className='text-foreground font-semibold'>
          {properties.length}
        </span>{' '}
        properties
      </div>

      {filteredAndSorted.length ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredAndSorted.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className='py-16 text-center'>
          <h3 className='text-xl font-semibold'>No Properties Found</h3>
          <p className='text-muted-foreground'>
            Try adjusting your search, filter, or sort criteria.
          </p>
        </div>
      )}
    </div>
  )
}
