import { createFileRoute } from '@tanstack/react-router'
import { PaymentsPage } from '../../../features/payments/index'

export const Route = createFileRoute('/_authenticated/payments/')({
  component: PaymentsPage,
})
