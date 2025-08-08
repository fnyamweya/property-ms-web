import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/maintenance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/maintenance/"!</div>
}
