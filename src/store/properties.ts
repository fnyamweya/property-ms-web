import { apiClient } from '@/api'
import type {
  Property,
  CreatePropertyDTO,
  UpdatePropertyDTO,
  // Paginated, // <- not required with the flexible normalizer below
} from '@/types/property'
import { create } from 'zustand'
import { parseError } from '@/utils/errorParser'
import { ENDPOINTS } from '@/constants/endpoints'

export type RequestStatus = 'idle' | 'loading' | 'error'

export type ListParams = {
  page?: number
  limit?: number
  organizationId?: string
  ownerId?: string
  listed?: boolean
  search?: string
}

/** Map UI create DTO -> backend payload */
function toBackendCreatePayload(dto: CreatePropertyDTO) {
  return {
    name: dto.name,
    code: (dto as any).code,
    description: dto.description,
    isListed: dto.isListed ?? false,
    organizationId: (dto as any).organizationId,
    config: dto.config ?? {},
    // UI uses propertyType; backend expects type
    type: (dto as any).propertyType ?? (dto as any).type ?? 'Unknown',
  }
}

/** Map UI update DTO -> backend payload */
function toBackendUpdatePayload(dto: UpdatePropertyDTO) {
  const out: any = {}
  if (dto.name !== undefined) out.name = dto.name
  if (dto.isListed !== undefined) out.isListed = dto.isListed
  if (dto.config !== undefined) out.config = dto.config
  if ((dto as any).propertyType !== undefined)
    out.type = (dto as any).propertyType
  if ((dto as any).type !== undefined) out.type = (dto as any).type
  return out
}

/** Flexible page shapes the API might return */
type FlexiblePage<T> =
  | { items: T[]; total?: number; page?: number; limit?: number }
  | { data: T[]; total?: number; page?: number; limit?: number }
  | { rows: T[]; total?: number; page?: number; limit?: number }
  | { results: T[]; total?: number; page?: number; limit?: number }
  | T[] // sometimes APIs just return arrays

function normalizePage<T>(payload: FlexiblePage<T> | unknown): {
  items: T[]
  total?: number
  page?: number
  limit?: number
} {
  const anyp = payload as any
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

interface PropertiesState {
  // Data
  properties: Property[]
  total: number
  page: number
  limit: number
  current?: Property

  // Status & errors
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

  restoreStatus: RequestStatus
  restoreError?: string

  // Actions
  setCurrent: (id?: string) => void

  fetchProperties: (params?: ListParams) => Promise<void>
  fetchProperty: (id: string) => Promise<void>

  createProperty: (payload: CreatePropertyDTO) => Promise<Property>
  updateProperty: (id: string, payload: UpdatePropertyDTO) => Promise<Property>

  deleteProperty: (id: string) => Promise<void>
  restoreProperty?: (id: string) => Promise<Property> // remove if not supported
}

export const usePropertiesStore = create<PropertiesState>((set, get) => ({
  // Data
  properties: [],
  total: 0,
  page: 1,
  limit: 10,
  current: undefined,

  // Status
  fetchStatus: 'idle',
  fetchOneStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  restoreStatus: 'idle',

  setCurrent(id) {
    if (!id) return set({ current: undefined })
    const found = get().properties.find((p) => p.id === id)
    set({ current: found })
  },

  async fetchProperties(params) {
    set({ fetchStatus: 'loading', fetchError: undefined })
    try {
      const raw = await apiClient.request<unknown>({
        endpointKey: ENDPOINTS.GET_PROPERTIES,
        method: 'GET',
        queryParams: {
          page: params?.page,
          limit: params?.limit,
          organizationId: params?.organizationId,
          ownerId: params?.ownerId,
          // If your API wants 1/0 instead of booleans, do:
          listed:
            params?.listed !== undefined ? (params.listed ? 1 : 0) : undefined,
          // listed: params?.listed,
          q: params?.search,
        },
      })

      const page = normalizePage<Property>(raw)
      const items = page.items ?? []

      set({
        properties: items,
        total: page.total ?? items.length,
        page: page.page ?? params?.page ?? get().page,
        limit: page.limit ?? params?.limit ?? get().limit,
        fetchStatus: 'idle',
        fetchError: undefined,
      })

      const cur = get().current
      if (cur && !items.some((p) => p.id === cur.id)) {
        set({ current: undefined })
      }
    } catch (err) {
      set({ fetchStatus: 'error', fetchError: parseError(err) })
    }
  },

  async fetchProperty(id: string) {
    set({ fetchOneStatus: 'loading', fetchOneError: undefined })
    try {
      const item = await apiClient.request<Property>({
        endpointKey: ENDPOINTS.GET_PROPERTY,
        method: 'GET',
        pathParams: { id },
      })
      const list = get().properties
      const idx = list.findIndex((p) => p.id === item.id)
      const next =
        idx >= 0
          ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
          : [item, ...list]
      set({
        properties: next,
        current: item,
        fetchOneStatus: 'idle',
        fetchOneError: undefined,
      })
    } catch (err) {
      set({ fetchOneStatus: 'error', fetchOneError: parseError(err) })
    }
  },

  async createProperty(payload: CreatePropertyDTO) {
    set({ createStatus: 'loading', createError: undefined })
    try {
      const created = await apiClient.request<Property>({
        endpointKey: ENDPOINTS.CREATE_PROPERTY,
        method: 'POST',
        body: toBackendCreatePayload(payload),
      })
      set((s) => ({
        properties: [created, ...s.properties],
        current: created,
        createStatus: 'idle',
        createError: undefined,
      }))
      return created
    } catch (err) {
      set({ createStatus: 'error', createError: parseError(err) })
      throw err
    }
  },

  async updateProperty(id: string, payload: UpdatePropertyDTO) {
    set({ updateStatus: 'loading', updateError: undefined })
    try {
      const updated = await apiClient.request<Property>({
        endpointKey: ENDPOINTS.UPDATE_PROPERTY,
        method: 'PATCH',
        pathParams: { id },
        body: toBackendUpdatePayload(payload),
      })
      set((s) => {
        const idx = s.properties.findIndex((p) => p.id === updated.id)
        const next =
          idx >= 0
            ? [
                ...s.properties.slice(0, idx),
                updated,
                ...s.properties.slice(idx + 1),
              ]
            : [updated, ...s.properties]
        return {
          properties: next,
          current: updated.id === s.current?.id ? updated : s.current,
          updateStatus: 'idle',
          updateError: undefined,
        }
      })
      return updated
    } catch (err) {
      set({ updateStatus: 'error', updateError: parseError(err) })
      throw err
    }
  },

  async deleteProperty(id: string) {
    set({ deleteStatus: 'loading', deleteError: undefined })
    try {
      await apiClient.request<void>({
        endpointKey: ENDPOINTS.DELETE_PROPERTY,
        method: 'DELETE',
        pathParams: { id },
      })
      set((s) => ({
        properties: s.properties.filter((p) => p.id !== id),
        current: s.current?.id === id ? undefined : s.current,
        deleteStatus: 'idle',
        deleteError: undefined,
      }))
    } catch (err) {
      set({ deleteStatus: 'error', deleteError: parseError(err) })
      throw err
    }
  },

  // Only include if the API supports it: POST /properties/:id/restore
  async restoreProperty(id: string) {
    set({ restoreStatus: 'loading', restoreError: undefined })
    try {
      const restored = await apiClient.request<Property>({
        endpointKey: ENDPOINTS.RESTORE_PROPERTY,
        method: 'POST',
        pathParams: { id },
      })
      set((s) => ({
        properties: [restored, ...s.properties],
        current: restored,
        restoreStatus: 'idle',
        restoreError: undefined,
      }))
      return restored
    } catch (err) {
      set({ restoreStatus: 'error', restoreError: parseError(err) })
      throw err
    }
  },
}))
