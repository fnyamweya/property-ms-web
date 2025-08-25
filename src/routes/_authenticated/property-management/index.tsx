import { createFileRoute } from '@tanstack/react-router'
import Properties from '@/features/properties'

/**
 * Route definition for the property management page. Renders the
 * properties DataTable under the authenticated layout. The route
 * corresponds to the `/property-management` path in the app.
 */
export const Route = createFileRoute('/_authenticated/property-management/')({
  component: Properties,
})
