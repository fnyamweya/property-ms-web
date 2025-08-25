import { createFileRoute } from '@tanstack/react-router'
import Locations from '@/features/locations'

/**
 * Route definition for the locations management page. Renders the
 * locations DataTable under the authenticated layout. This path
 * corresponds to `/locations` within the authenticated app.
 */
export const Route = createFileRoute('/_authenticated/locations/')({
  component: Locations,
})
