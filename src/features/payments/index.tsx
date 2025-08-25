'use client'

import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BulkActionsBar } from './components/bulk-actions-bar'
import { FiltersBar } from './components/filters-bar'
import { NewPaymentDialog } from './components/new-payment-dialog'
import { PaymentDrawer } from './components/payment-drawer'
import { PaymentsHeader } from './components/payments-header'
import { PaymentsTable } from './components/payments-table'
import { RefundDialog } from './components/refund-dialog'
import { SummaryCards } from './components/summary-cards'
import { mockPayments } from './mock'
import type { Payment, PaymentsQuery } from './types'

export const Route = createFileRoute('/_authenticated/payments/')({
  component: PaymentsPage,
})

function usePaymentsData(query: PaymentsQuery) {
  // In real app: fetch from API based on query (SWR/React Query)
  const data = useMemo(() => {
    let rows = [...mockPayments]

    if (query.q?.trim()) {
      const q = query.q.toLowerCase()
      rows = rows.filter(
        (p) =>
          p.tenantName.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          (p.unit && p.unit.toLowerCase().includes(q)) ||
          (p.propertyName && p.propertyName.toLowerCase().includes(q))
      )
    }
    if (query.status && query.status !== 'All')
      rows = rows.filter((p) => p.status === query.status)
    if (query.method && query.method !== 'All')
      rows = rows.filter((p) => p.method === query.method)
    if (query.direction && query.direction !== 'All')
      rows = rows.filter((p) => p.direction === query.direction)
    if (query.propertyId && query.propertyId !== 'All')
      rows = rows.filter((p) => p.propertyName === query.propertyId)
    if (query.dateFrom)
      rows = rows.filter((p) => p.createdAt >= query.dateFrom!)
    if (query.dateTo) rows = rows.filter((p) => p.createdAt <= query.dateTo!)

    const pageSize = query.pageSize ?? 10
    const page = query.page ?? 1
    const total = rows.length
    const paged = rows.slice((page - 1) * pageSize, page * pageSize)

    const totalIn = rows
      .filter((p) => p.direction === 'Incoming')
      .reduce((s, p) => s + p.amount, 0)
    const totalOut = rows
      .filter((p) => p.direction === 'Outgoing')
      .reduce((s, p) => s + p.amount, 0)

    return { rows: paged, total, page, pageSize, totalIn, totalOut }
  }, [query])

  return data
}

export function PaymentsPage() {
  const [query, setQuery] = useState<PaymentsQuery>({
    page: 1,
    pageSize: 10,
    status: 'All',
    method: 'All',
    direction: 'All',
    propertyId: 'All',
    dateFrom: null,
    dateTo: null,
  })
  const { rows, total, page, pageSize, totalIn, totalOut } =
    usePaymentsData(query)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Payment | null>(null)

  const [newOpen, setNewOpen] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [refundPayment, setRefundPayment] = useState<Payment | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className='space-y-4'>
      <PaymentsHeader onNew={() => setNewOpen(true)} />

      <FiltersBar
        value={query}
        onChange={setQuery}
        propertyOptions={[
          { id: 'Sunset Heights', name: 'Sunset Heights' },
          { id: 'Westlands Tower', name: 'Westlands Tower' },
          { id: 'Industrial Trade Park', name: 'Industrial Trade Park' },
        ]}
      />

      <SummaryCards totalIn={totalIn} totalOut={totalOut} count={total} />

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onExport={() => {
          // TODO: export CSV for selectedIds
        }}
        onMarkComplete={() => {
          // TODO: mark selected as completed
        }}
        onClear={() => setSelectedIds([])}
      />

      <PaymentsTable
        rows={rows}
        onView={(p) => {
          setSelected(p)
          setDrawerOpen(true)
        }}
        onRefund={(p) => {
          setRefundPayment(p)
          setRefundOpen(true)
        }}
      />

      {/* Simple pagination (replace with your Pagination component if you have one) */}
      <div className='flex items-center justify-between'>
        <div className='text-muted-foreground text-xs'>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{' '}
          of {total}
        </div>
        <div className='flex gap-2'>
          <button
            className='rounded border px-2 py-1 text-sm disabled:opacity-50'
            disabled={page <= 1}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
          >
            Prev
          </button>
          <button
            className='rounded border px-2 py-1 text-sm disabled:opacity-50'
            disabled={page * pageSize >= total}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
          >
            Next
          </button>
        </div>
      </div>

      <PaymentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        payment={selected}
      />
      <NewPaymentDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={(payload) => {
          // TODO: call API; for now, console.log:
          console.log('create payment ->', payload)
        }}
      />
      <RefundDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        payment={refundPayment}
        onConfirm={(reason) => {
          // TODO: call API to refund
          console.log('refund ->', refundPayment?.id, { reason })
        }}
      />
    </div>
  )
}
