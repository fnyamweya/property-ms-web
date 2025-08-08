/*
 * Hook for accessing user list state. Wraps around the underlying
 * Zustand users store and exposes its values and actions. Components
 * interested only in part of the state can selectively destructure the
 * returned object to avoid unnecessary re‑renders.
 */

import { useUsersStore } from '@/store/users'

export function useUsers() {
  const users = useUsersStore((state) => state.users)
  const status = useUsersStore((state) => state.status)
  const error = useUsersStore((state) => state.error)
  const fetchUsers = useUsersStore((state) => state.fetchUsers)
  return { users, status, error, fetchUsers }
}