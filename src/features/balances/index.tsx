'use client'

import { useMemo, useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AdjustBalanceDialog } from './components/adjust-balance-dialog'
import { AgingLegend } from './components/aging-legend'
import { BalanceDrawer } from './components/balance-drawer'
import { BalancesHeader } from './components/balances-header'
import { BalancesTable } from './components/balances-table'
import { SummaryCards } from './components/summary-cards'
import { mockBalances } from './mock'
import type { BalanceRow } from './types'
import { computeAging } from './utils'

export const Route = createFileRoute('/_authenticated/balances/')({
  component: BalancesPage,
})

export function BalancesPage() {
  const [rows, setRows] = useState<BalanceRow[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<BalanceRow | null>(null)
  const [adjustOpen, setAdjustOpen] = useState(false)

  // bootstrap + compute aging
  useEffect(() => {
    const withAging = mockBalances.map((r) => ({
      ...r,
      aging: computeAging(r),
    }))
    setRows(withAging)
  }, [])

  const totals = useMemo(() => {
    const ar = rows
      .filter((r) => r.kind === 'AR')
      .reduce((s, r) => s + Math.max(r.balance, 0), 0)
    const ap = rows
      .filter((r) => r.kind === 'AP')
      .reduce((s, r) => s + Math.min(r.balance, 0), 0)
    return { totalAR: ar, totalAP: ap }
  }, [rows])

  return (
    <div className='space-y-4'>
      <BalancesHeader onAdjust={() => setAdjustOpen(true)} />
      <SummaryCards totalAR={totals.totalAR} totalAP={totals.totalAP} />
      <AgingLegend />

      <BalancesTable
        rows={rows}
        onView={(r) => {
          setSelected(r)
          setDrawerOpen(true)
        }}
      />

      <BalanceDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        row={selected}
      />
      <AdjustBalanceDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        onConfirm={(payload) => {
          // TODO: POST /balances/adjust
          console.log('adjust ->', payload)
        }}
      />
    </div>
  )
}
