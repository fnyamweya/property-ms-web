export interface Organization {
  id: string
  name: string
  plan?: string | null
  logoUrl?: string | null
}

export interface UserOrganizationsResponse {
  apiVersion: string
  kind: 'USER'
  data: Organization[]
  metadata?: {
    correlationId?: string
    message?: string
    [k: string]: unknown
  }
}
