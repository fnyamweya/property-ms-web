import { useEffect } from 'react'
import { useOrganizationsStore } from '@/store/organizations'

export function useUserOrganizations(userId?: string) {
  const { byUserId, status, error, fetchUserOrganizations } =
    useOrganizationsStore()
  const organizations = (userId && byUserId[userId]) || []

  useEffect(() => {
    if (userId && !byUserId[userId]) {
      fetchUserOrganizations(userId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    organizations,
    status,
    error,
    refetch: () =>
      userId ? fetchUserOrganizations(userId) : Promise.resolve([]),
  }
}
