"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Property } from '../types'

export function PropertyCard({ property }: { property: Property }) {
  const income = property.units.reduce((sum, u) => sum + u.currentLeaseAmount, 0)
  const occupied = property.units.filter((u) => u.status === 'Occupied').length
  const occupancy = property.units.length
    ? Math.round((occupied / property.units.length) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='truncate'>{property.name}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-1 text-sm'>
        <div className='text-muted-foreground truncate'>{property.address}</div>
        <div>Units: {property.units.length}</div>
        <div>Occupancy: {occupancy}%</div>
        <div>
          Income: {property.units[0]?.currency ?? 'KES'} {income.toLocaleString('en-KE')}
        </div>
      </CardContent>
    </Card>
  )
}

