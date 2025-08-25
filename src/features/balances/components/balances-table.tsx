'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '../../payments/components/empty-state'
import type { BalanceRow as Row } from '../types'
import { BalanceRow } from './balances-row'

export function BalancesTable({
  rows,
  onView,
}: {
  rows: Row[]
  onView: (r: Row) => void
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title='No balances found'
        description='Try adjusting filters or date range.'
      />
    )
  }
  return (
    <div className='overflow-auto rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Opening</TableHead>
            <TableHead>Debits</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Aging</TableHead>
            <TableHead className='w-[80px] text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <BalanceRow key={r.id} r={r} onView={onView} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
