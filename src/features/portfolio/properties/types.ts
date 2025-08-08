export interface Property {
  id: string
  name: string
  address: string
  imageUrl: string
  ownerId: string
  propertyType: 'Residential' | 'Commercial' | 'Mixed-Use' | 'Industrial'
  units: Unit[]
  mrRequestCounts: {
    open: number
    inProgress: number
  }
}

export interface Unit {
  id: string
  unitIdentifier: string
  status: 'Occupied' | 'Vacant' | 'Under Maintenance'
  leaseType: 'Residential Rent' | 'Commercial Lease' | 'Owner Occupied'
  squareFootage: number

  currentLeaseAmount: number
  currency: string
  tenantId?: string
  tenantName?: string
  leaseEndDate?: Date
}
