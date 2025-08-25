'use client'

import { useMemo } from 'react'
import { usePropertyUnitsStore } from '@/store/property-units'
import { useShallow } from 'zustand/react/shallow'

export const usePropertyUnits = (propertyId?: string) => {
  const slice = usePropertyUnitsStore(
    useShallow((s) => ({
      units: s.units,
      total: s.total,
      page: s.page,
      limit: s.limit,
      status: s.fetchStatus,
      error: s.fetchError,

      fetchUnits: s.fetchUnits,
      fetchUnit: s.fetchUnit,
      createUnit: s.createUnit,
      updateUnit: s.updateUnit,
      deleteUnit: s.deleteUnit,
      setCurrent: s.setCurrent,
      current: s.current,
    }))
  )

  const scopedUnits = useMemo(() => {
    if (!propertyId) return slice.units
    const first = (slice.units as any)[0]
    const hasPid = first && typeof first === 'object' && '__pid' in first
    return hasPid
      ? (slice.units as any).filter((u: any) => u.__pid === propertyId)
      : slice.units
  }, [slice.units, propertyId])

  return { ...slice, units: scopedUnits }
}
