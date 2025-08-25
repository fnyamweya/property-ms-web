'use client'

import { Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BalancesHeader({ onAdjust }: { onAdjust: () => void }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h1 className='text-lg font-semibold tracking-tight'>Balances</h1>
        <p className='text-muted-foreground text-sm'>
          Aging, open receivables/payables, and ledger drill-downs.
        </p>
      </div>
      <Button onClick={onAdjust}>
        <Scale className='mr-2 h-4 w-4' />
        Adjust Balance
      </Button>
    </div>
  )
}
