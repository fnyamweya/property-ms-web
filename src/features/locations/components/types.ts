export type LocationDTO = {
  id?: string
  localAreaName: string
  county: string
  town?: string | null
  street?: string | null
  coverageDetails?: string | null
  parentId?: string | null
  centerPoint?: { lat: number; lng: number } | null
}

export type Location = {
  id: string
  localAreaName: string
  county: string
  town?: string | null
  street?: string | null
  coverageDetails?: string | null
  parent?: { id: string; localAreaName: string } | null
  centerPoint?: { type: 'Point'; coordinates: [number, number] } | null
  createdAt: string
  updatedAt: string
}

export type Paginated<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}
