import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/properties/$id/tenants/')(
  {
    component: TenantsPage,
  }
)

function TenantsPage() {
  const { id } = Route.useParams()
  return <div>Tenants for property {id}</div>
}

export default TenantsPage
