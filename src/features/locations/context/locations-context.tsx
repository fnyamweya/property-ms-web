import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Location } from '../components/types'

/**
 * Dialog names for the locations feature. Keeping these values in a
 * union type ensures type safety when opening or closing dialogs.
 */
export type LocationsDialogType = 'create' | 'update' | 'delete' | 'restore'

interface LocationsContextType {
  open: LocationsDialogType | null
  setOpen: (val: LocationsDialogType | null) => void
  currentRow: Location | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Location | null>>
}

const LocationsContext = React.createContext<LocationsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

/**
 * Provider component that houses dialog state and the currently
 * selected location row. Most location components should wrap
 * themselves in this provider to access the context via `useLocations`.
 */
export default function LocationsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<LocationsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Location | null>(null)
  return (
    <LocationsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </LocationsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLocations = () => {
  const ctx = React.useContext(LocationsContext)
  if (!ctx) {
    throw new Error('useLocations must be used within a <LocationsProvider>')
  }
  return ctx
}