import { createFileRoute } from '@tanstack/react-router'
import { PropertyUnits } from '@/features/portfolio/properties/$id/units'

export const Route = createFileRoute('/_authenticated/properties/$id/units/')({
  component: PropertyUnitsRoute,
})

function PropertyUnitsRoute() {
  const { id } = Route.useParams()
  return <PropertyUnits propertyId={id} />
}
