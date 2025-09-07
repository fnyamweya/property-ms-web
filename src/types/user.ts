export type UserStatus =
  | 'pending_verification'
  | 'active'
  | 'suspended'
  | 'deleted'

export interface User {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
  metadata: unknown | null
  deletedAt: string | null
  firstName: string
  fullName?: string
  lastName: string
  email: string
  phone: string
  avatar: string | null
  bio: string | null
  status: UserStatus
  // Optional fields that can come from /auth/me
  organizationIds?: string[]
  organizations?: OrganizationBrief[]
  currentOrganizationId?: string | null
}

export interface UsersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UsersListResponse {
  apiVersion: string
  kind: 'USER'
  data: User[]
  pagination: UsersPagination
  metadata?: {
    correlationId?: string
    message?: string
    [k: string]: unknown
  }
}

export interface CreateUserPayload {
  firstName: string
  lastName: string
  phone: string
  email: string
  credential: string
}

export interface CreateUserResponse {
  message?: string
  data: User
}

export interface OrganizationBrief {
  id: string
  name: string
  plan?: string | null
  logoUrl?: string | null
}
