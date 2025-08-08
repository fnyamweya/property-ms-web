import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/staff/')({
  component: StaffPage,
})

function StaffPage() {
  return <div>Hello "/_authenticated/staff/"!</div>
}
