import { useUsersStore } from '@/store/users'
import type { CreateUserPayload } from '@/types/user'

export function useUsers() {
  const { items, status, error, page, limit, total, totalPages, fetchUsers } =
    useUsersStore()
  return {
    users: items,
    status,
    error,
    page,
    limit,
    total,
    totalPages,
    fetchUsers,
  }
}

export function useCreateUser() {
  const { createUser, createStatus, createError } = useUsersStore()
  const create = async (payload: CreateUserPayload) => {
    return await createUser(payload)
  }
  return {
    createUser: create,
    createStatus,
    createError,
  }
}
