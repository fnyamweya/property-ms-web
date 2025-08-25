export interface PropertyUnit {
  id: string
  unitNumber: string
  name?: string
  isActive: boolean
  isListed: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  propertyId: string
  addressId?: string | null
  tenantId?: string | null

  // Optional expanded relations
  property?: {
    id: string
    name: string
  }
  address?: {
    id: string
    street?: string
    city?: string
    country?: string
  } | null
  tenant?: {
    id: string
    name?: string
  } | null
  leases?: Array<{
    id: string
    startDate: string
    endDate?: string
  }>
  requests?: Array<{
    id: string
    type: string
    status: string
  }>
}

export interface CreatePropertyUnitDTO {
  propertyId: string
  unitNumber: string
  name?: string
  addressId?: string
  isListed?: boolean
  metadata?: Record<string, any>
  tenantId?: string
}

export interface UpdatePropertyUnitDTO {
  unitNumber?: string
  name?: string
  addressId?: string | null
  isListed?: boolean
  metadata?: Record<string, any>
  tenantId?: string | null
}
