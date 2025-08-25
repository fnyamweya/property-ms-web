'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Payment } from '../types'
import { EmptyState } from './empty-state'
import { PaymentRow } from './payment-row'

export function PaymentsTable(props: {
  rows: Payment[]
  onView: (p: Payment) => void
  onRefund: (p: Payment) => void
}) {
  const { rows, onView, onRefund } = props
  if (rows.length === 0) {
    return (
      <EmptyState
        title='No payments found'
        description='Try adjusting filters or date range.'
      />
    )
  }
  return (
    <div className='overflow-auto rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[90px]'>Date</TableHead>
            <TableHead>Payer</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Flow</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-[90px] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p) => (
            <PaymentRow key={p.id} p={p} onView={onView} onRefund={onRefund} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
