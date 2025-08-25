import { apiClient } from '@/api'
import type {
  PropertyUnit,
  CreatePropertyUnitDTO,
  UpdatePropertyUnitDTO,
} from '@/types/property-unit'
import { create } from 'zustand'
import { parseError } from '@/utils/errorParser'
import { ENDPOINTS } from '@/constants/endpoints'
import type { Unit } from '@/features/portfolio/properties/types'

export type RequestStatus = 'idle' | 'loading' | 'error'

export type UnitsListParams = {
  propertyId: string
  page?: number
  limit?: number
  onlyListed?: boolean
  onlyAvailable?: boolean
  onlyOccupied?: boolean
  search?: string
  includeLeases?: boolean
  includeRequests?: boolean
}

/** Flexible page payloads your backend(s) might return */
type FlexiblePage<T> =
  | { items: T[]; total?: number; page?: number; limit?: number }
  | { data: T[]; total?: number; page?: number; limit?: number }
  | { rows: T[]; total?: number; page?: number; limit?: number }
  | { results: T[]; total?: number; page?: number; limit?: number }
  | T[]

/** Normalizes many page shapes AND unwraps { data: {...} } envelopes */
function normalizePage<T>(payload: unknown): {
  items: T[]
  total?: number
  page?: number
  limit?: number
} {
  const anyp = payload as any

  // Unwrap common envelope: { apiVersion, kind, data: {...} }
  if (anyp && !Array.isArray(anyp) && anyp.data && !Array.isArray(anyp.data)) {
    return normalizePage<T>(anyp.data)
  }

  if (Array.isArray(anyp)) return { items: anyp }
  if (Array.isArray(anyp?.items))
    return {
      items: anyp.items,
      total: anyp.total,
      page: anyp.page,
      limit: anyp.limit,
    }
  if (Array.isArray(anyp?.data))
    return {
      items: anyp.data,
      total: anyp.total,
      page: anyp.page,
      limit: anyp.limit,
    }
  if (Array.isArray(anyp?.rows))
    return {
      items: anyp.rows,
      total: anyp.total,
      page: anyp.page,
      limit: anyp.limit,
    }
  if (Array.isArray(anyp?.results))
    return {
      items: anyp.results,
      total: anyp.total,
      page: anyp.page,
      limit: anyp.limit,
    }

  return { items: [] }
}

/** Backend DTO shapers (unchanged) */
function toBackendCreatePayload(dto: CreatePropertyUnitDTO) {
  return {
    unitNumber: dto.unitNumber,
    name: dto.name,
    addressId: dto.addressId,
    isListed: dto.isListed ?? false,
    metadata: dto.metadata ?? {},
    tenantId: (dto as any).tenantId, // optional
  }
}
function toBackendUpdatePayload(dto: UpdatePropertyUnitDTO) {
  const out: any = {}
  if (dto.unitNumber !== undefined) out.unitNumber = dto.unitNumber
  if (dto.name !== undefined) out.name = dto.name
  if (dto.addressId !== undefined) out.addressId = dto.addressId // pass null to clear
  if (dto.isListed !== undefined) out.isListed = dto.isListed
  if (dto.metadata !== undefined) out.metadata = dto.metadata
  if ((dto as any).tenantId !== undefined) out.tenantId = (dto as any).tenantId // pass null to vacate
  return out
}

/** Convert backend PropertyUnit -> UI Unit type (inline, no external mapper) */
function toUIUnit(u: PropertyUnit): Unit {
  const md = (u as any).metadata ?? {}

  const squareFootage =
    toNumber(md.sizeSqFt) ?? toNumber(md.areaSqFt) ?? toNumber(md.area) ?? 0

  const hasTenant = !!(u as any).tenant || !!(u as any).tenantId
  const status: Unit['status'] = hasTenant
    ? 'Occupied'
    : (u as any).isListed
      ? 'Vacant'
      : 'Under Maintenance'

  // Best-effort lease type from metadata / occupancy
  const leaseType: Unit['leaseType'] =
    (md.leaseType as Unit['leaseType']) ??
    ((hasTenant ? 'Residential Rent' : 'Owner Occupied') as Unit['leaseType'])

  return {
    id: u.id,
    unitIdentifier: (u as any).unitNumber ?? (u as any).name ?? '—',
    status,
    leaseType,
    squareFootage,

    currentLeaseAmount: toNumber((u as any).currentLeaseAmount) ?? 0,
    currency: (u as any).currency ?? 'KES',

    tenantId: (u as any).tenant?.id ?? (u as any).tenantId ?? undefined,
    tenantName: (u as any).tenant?.name ?? undefined,
    leaseEndDate: (u as any).leaseEndDate
      ? new Date((u as any).leaseEndDate)
      : undefined,
  }
}

function toNumber(v: any): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

interface UnitsState {
  /** UI units for the currently loaded property (we overwrite on each fetchUnits call) */
  units: Unit[]
  total: number
  page: number
  limit: number
  current?: Unit

  fetchStatus: RequestStatus
  fetchError?: string

  fetchOneStatus: RequestStatus
  fetchOneError?: string

  createStatus: RequestStatus
  createError?: string

  updateStatus: RequestStatus
  updateError?: string

  deleteStatus: RequestStatus
  deleteError?: string

  setCurrent: (id?: string) => void

  fetchUnits: (params: UnitsListParams) => Promise<void>
  fetchUnit: (propertyId: string, unitIdOrNumber: string) => Promise<void>

  createUnit: (propertyId: string, dto: CreatePropertyUnitDTO) => Promise<Unit>
  updateUnit: (unitId: string, dto: UpdatePropertyUnitDTO) => Promise<Unit>
  deleteUnit: (unitId: string) => Promise<void>
}

export const usePropertyUnitsStore = create<UnitsState>((set, get) => ({
  units: [],
  total: 0,
  page: 1,
  limit: 10,
  current: undefined,

  fetchStatus: 'idle',
  fetchOneStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',

  setCurrent(id) {
    if (!id) return set({ current: undefined })
    const found = get().units.find((u) => u.id === id)
    set({ current: found })
  },

  async fetchUnits(params) {
    set({ fetchStatus: 'loading', fetchError: undefined })
    try {
      const raw = await apiClient.request<unknown>({
        endpointKey: ENDPOINTS.GET_PROPERTY_UNITS,
        method: 'GET',
        pathParams: { id: params.propertyId },
        queryParams: {
          page: params.page,
          limit: params.limit,
          onlyListed: params.onlyListed ? 1 : undefined,
          onlyAvailable: params.onlyAvailable ? 1 : undefined,
          onlyOccupied: params.onlyOccupied ? 1 : undefined,
          search: params.search,
          includeLeases: params.includeLeases ? 1 : undefined,
          includeRequests: params.includeRequests ? 1 : undefined,
        },
      })

      const page = normalizePage<PropertyUnit>(raw)
      const items = (page.items ?? []).map(toUIUnit)

      const itemsWithPid = items.map((u) => ({
        ...(u as any),
        __pid: params.propertyId,
      }))

      set({
        units: itemsWithPid as any,
        total: page.total ?? items.length,
        page: page.page ?? params.page ?? get().page,
        limit: page.limit ?? params.limit ?? get().limit,
        fetchStatus: 'idle',
        fetchError: undefined,
      })

      const cur = get().current
      if (cur && !itemsWithPid.some((u: any) => u.id === cur.id)) {
        set({ current: undefined })
      }
    } catch (err) {
      set({ fetchStatus: 'error', fetchError: parseError(err) })
    }
  },

  async fetchUnit(propertyId, unitIdOrNumber) {
    set({ fetchOneStatus: 'loading', fetchOneError: undefined })
    try {
      let item: PropertyUnit | null = null

      // crude UUID-ish check
      if (/^[0-9a-f-]{36}$/i.test(unitIdOrNumber)) {
        item = await apiClient.request<PropertyUnit>({
          endpointKey: ENDPOINTS.GET_PROPERTY_UNIT,
          method: 'GET',
          pathParams: { uid: unitIdOrNumber },
        })
      } else {
        item = (await apiClient.request<PropertyUnit | null>({
          endpointKey: ENDPOINTS.GET_PROPERTY_UNIT_BY_NUMBER,
          method: 'GET',
          pathParams: { id: propertyId },
          queryParams: { unitNumber: unitIdOrNumber },
        })) as any
      }

      if (!item) throw new Error('Unit not found')

      const ui = toUIUnit(item)
      const list = get().units
      const idx = list.findIndex((u) => u.id === ui.id)
      const next =
        idx >= 0
          ? [...list.slice(0, idx), ui, ...list.slice(idx + 1)]
          : [ui, ...list]

      set({
        units: next,
        current: ui,
        fetchOneStatus: 'idle',
        fetchOneError: undefined,
      })
    } catch (err) {
      set({ fetchOneStatus: 'error', fetchOneError: parseError(err) })
    }
  },

  async createUnit(propertyId, dto) {
    set({ createStatus: 'loading', createError: undefined })
    try {
      const created = await apiClient.request<PropertyUnit>({
        endpointKey: ENDPOINTS.CREATE_PROPERTY_UNIT,
        method: 'POST',
        pathParams: { id: propertyId },
        body: toBackendCreatePayload(dto),
      })
      const ui = toUIUnit(created)
      set((s) => ({
        units: [ui, ...s.units],
        current: ui,
        createStatus: 'idle',
        createError: undefined,
      }))
      return ui
    } catch (err) {
      set({ createStatus: 'error', createError: parseError(err) })
      throw err
    }
  },

  async updateUnit(unitId, dto) {
    set({ updateStatus: 'loading', updateError: undefined })
    try {
      const updated = await apiClient.request<PropertyUnit>({
        endpointKey: ENDPOINTS.UPDATE_PROPERTY_UNIT,
        method: 'PATCH',
        pathParams: { uid: unitId },
        body: toBackendUpdatePayload(dto),
      })
      const ui = toUIUnit(updated)

      set((s) => {
        const idx = s.units.findIndex((u) => u.id === unitId)
        const next =
          idx >= 0
            ? [...s.units.slice(0, idx), ui, ...s.units.slice(idx + 1)]
            : [ui, ...s.units]
        return {
          units: next,
          current: s.current?.id === unitId ? ui : s.current,
          updateStatus: 'idle',
          updateError: undefined,
        }
      })
      return ui
    } catch (err) {
      set({ updateStatus: 'error', updateError: parseError(err) })
      throw err
    }
  },

  async deleteUnit(unitId) {
    set({ deleteStatus: 'loading', deleteError: undefined })
    try {
      await apiClient.request<void>({
        endpointKey: ENDPOINTS.DELETE_PROPERTY_UNIT,
        method: 'DELETE',
        pathParams: { uid: unitId },
      })
      set((s) => ({
        units: s.units.filter((u) => u.id !== unitId),
        current: s.current?.id === unitId ? undefined : s.current,
        deleteStatus: 'idle',
        deleteError: undefined,
      }))
    } catch (err) {
      set({ deleteStatus: 'error', deleteError: parseError(err) })
      throw err
    }
  },
}))
