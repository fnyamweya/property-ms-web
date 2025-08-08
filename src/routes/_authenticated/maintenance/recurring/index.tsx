import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/maintenance/recurring/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/maintenance/recurring/"!</div>
}
