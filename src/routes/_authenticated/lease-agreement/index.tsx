import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/lease-agreement/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/lease-agreement/"!</div>
}
