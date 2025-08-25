export interface Property {
  id: string
  name: string
  address: string
  imageUrl: string
  ownerId: string
  propertyType: 'Residential' | 'Commercial' | 'Mixed-Use' | 'Industrial'

  /** Units belonging to this property (UI-normalized) */
  units: Unit[]

  /** Aggregated counts for MR requests */
  mrRequestCounts: {
    open: number
    inProgress: number
  }
}

/** A unit inside a property (UI-facing type) */
export interface Unit {
  id: string

  /** Human identifier (unit number or name) */
  unitIdentifier: string

  /** Occupancy status derived from tenant + listing flags */
  status: 'Occupied' | 'Vacant' | 'Under Maintenance'

  /** Lease classification */
  leaseType: 'Residential Rent' | 'Commercial Lease' | 'Owner Occupied'

  /** Area in square feet */
  squareFootage: number

  /** Current lease/rent amount */
  currentLeaseAmount: number

  /** Currency code (default: KES) */
  currency: string

  /** Linked tenant (if occupied) */
  tenantId?: string
  tenantName?: string

  /** Lease expiration date (if leased) */
  leaseEndDate?: Date
}

/** Shape of metadata returned from backend for a unit */
export interface UnitMetadata {
  view?: string
  floor?: number
  bedrooms?: number
  bathrooms?: number
  sizeSqFt?: number
  areaSqFt?: number
  meterNumber?: string
  parking?: string
  notes?: string
  leaseType?: Unit['leaseType']
  [k: string]: unknown
}

/** Raw backend PropertyUnit response (before shaping into Unit) */
export interface PropertyUnit {
  id: string
  unitNumber?: string
  name?: string
  isActive: boolean
  isListed: boolean
  tenant?: { id: string; name?: string } | null
  metadata?: UnitMetadata
  createdAt?: string
  updatedAt?: string
  currentLeaseAmount?: number
  currency?: string
  leaseEndDate?: string
}
