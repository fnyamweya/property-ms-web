import { createFileRoute } from '@tanstack/react-router'
import { BalancesPage } from '@/features/balances'

export const Route = createFileRoute('/_authenticated/balances/')({
  component: BalancesPage,
})
