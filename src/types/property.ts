/*
 * Property type definitions used across the app.
 * - CreatePropertyDTO / UpdatePropertyDTO: request payloads
 * - Property: API response (hydrated)
 * - Paginated<T>: generic pagination wrapper
 */

export type UUID = string

export type PropertyType = 'Residential' | 'Commercial' | 'MixedUse' | 'Land'

/** Optional nested shapes (aligns with your entities) */
export type PropertyAddressDTO = {
  id?: UUID // for updates to existing address rows
  label?: string
  street?: string
  town?: string
  county?: string
  postalCode?: string
}

export type PropertyOwnerDTO = {
  id?: UUID // for updates
  name: string
  contact?: string
  phone?: string
  ownershipPercentage?: number // 0..100
}

/** CREATE payload (server generates id/timestamps) */
export type CreatePropertyDTO = {
  /** Human–readable name of the property, e.g. “Nyari Heights”. */
  name: string

  /** Public/business code (unique if provided). */
  code?: string

  /** REQUIRED — maps to entity.column `type` (we keep `propertyType` in the frontend). */
  propertyType: PropertyType

  /** Foreign key to Organization (required on your service layer). */
  organizationId: UUID

  /** Optional free–form description. */
  description?: string | null

  /** Listing & lifecycle flags. Defaults handled server-side. */
  isActive?: boolean
  isListed?: boolean

  /** Optional quick-address capture (UI-friendly). If you use full addresses[] below, you can omit these. */
  country?: string
  city?: string
  addressLine1?: string
  addressLine2?: string | null

  /** Geolocation (optional). */
  latitude?: number | null
  longitude?: number | null

  /** Optional nested data (cascaded on the backend). */
  addresses?: PropertyAddressDTO[]
  owners?: PropertyOwnerDTO[]

  /** Display-only / optional UI fields. */
  amenities?: string[]
  images?: any

  /** JSONB buckets on the backend. */
  config?: Record<string, any>
  metadata?: Record<string, any>
}

/** UPDATE payload (all fields optional; server merges/patches). */
export type UpdatePropertyDTO = Partial<
  Omit<CreatePropertyDTO, 'organizationId'>
> & {
  /** For moving a property to another organization (if allowed). */
  organizationId?: UUID
}

/** API response shape (hydrated property). */
export type Property = {
  id: UUID

  name: string
  code?: string

  /** Frontend keeps `propertyType`; backend column is `type`. */
  propertyType: PropertyType

  /** Computed/derived on the backend if you choose (optional in response). */
  unitsCount?: number

  isActive: boolean
  isListed: boolean

  /** Quick-address (optional if you use addresses[]). */
  country?: string
  city?: string
  addressLine1?: string
  addressLine2?: string | null

  description?: string | null

  latitude?: number | null
  longitude?: number | null

  /** Optional denormalized owner info for list UIs; prefer `owners[]` for detail pages. */
  ownerName?: string | null
  ownerEmail?: string | null
  ownerPhone?: string | null

  amenities?: string[]
  images?: any

  /** Rich/nested data. */
  addresses?: PropertyAddressDTO[]
  owners?: PropertyOwnerDTO[]

  /** JSONB from backend. */
  config?: Record<string, any>
  metadata?: Record<string, any>

  /** Server timestamps (ISO). */
  createdAt: string
  updatedAt: string
}

/** Generic pagination wrapper. */
export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/* ------------------------------------------------------------------ */
/* Helpers (optional): map FE DTO => BE payload with `type` property.  */
/* Use these to keep the BE happy while FE keeps propertyType wording. */
/* ------------------------------------------------------------------ */

/** Convert CreatePropertyDTO to backend payload (renames propertyType -> type). */
export function toBackendCreatePayload(
  dto: CreatePropertyDTO
): Record<string, any> {
  const { propertyType, ...rest } = dto

  return {
    ...rest,
    type: propertyType, // <-- critical: backend expects `type`
  }
}

/** Convert UpdatePropertyDTO to backend payload (renames propertyType -> type). */
export function toBackendUpdatePayload(
  dto: UpdatePropertyDTO
): Record<string, any> {
  const { propertyType, ...rest } = dto
  return propertyType ? { ...rest, type: propertyType } : rest
}
