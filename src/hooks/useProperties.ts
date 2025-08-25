'use client'

import { usePropertiesStore } from '@/store/properties'
import { useShallow } from 'zustand/react/shallow'

export const useProperties = () => {
  return usePropertiesStore(
    useShallow((s) => ({
      properties: s.properties,
      total: s.total,
      page: s.page,
      limit: s.limit,
      status: s.fetchStatus,
      error: s.fetchError,
      fetchProperties: s.fetchProperties,
    }))
  )
}
