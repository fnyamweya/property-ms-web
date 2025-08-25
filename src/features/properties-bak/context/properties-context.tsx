import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Property } from '@/types/property'

export type PropertiesDialogType = 'create' | 'update' | 'delete'

interface PropertiesContextType {
  open: PropertiesDialogType | null
  setOpen: (val: PropertiesDialogType | null) => void
  currentRow: Property | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Property | null>>
}

const PropertiesContext = React.createContext<PropertiesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function PropertiesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<PropertiesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Property | null>(null)
  return (
    <PropertiesContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </PropertiesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProperties = () => {
  const ctx = React.useContext(PropertiesContext)
  if (!ctx) {
    throw new Error('useProperties must be used within a <PropertiesProvider>')
  }
  return ctx
}