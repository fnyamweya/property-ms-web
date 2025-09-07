import { useState, useCallback } from 'react'
import { useOrganizationsStore } from '@/store/organizations'

export function useCreateOrganization() {
  const { createOrganization, status, error } = useOrganizationsStore()
  const [created, setCreated] = useState<null | { id: string; name: string }>(null)

  const mutate = useCallback(
    async (values: { name: string; plan?: string | null; logoUrl?: string | null }) => {
      setCreated(null)
      const org = await createOrganization(values)
      if (org) setCreated({ id: org.id, name: org.name })
      return org
    },
    [createOrganization]
  )

  return {
    mutate,
    status,
    error,
    created,
  }
}

