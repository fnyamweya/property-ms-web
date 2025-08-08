import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/balances/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/balances/"!</div>
}
