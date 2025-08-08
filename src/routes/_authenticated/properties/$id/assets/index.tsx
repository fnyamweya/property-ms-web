import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/properties/$id/assets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/properties/$id/assets/"!</div>
}
