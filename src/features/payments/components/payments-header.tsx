'use client'

import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaymentsHeader(props: { onNew: () => void }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3'>
      <div>
        <h1 className='text-lg font-semibold tracking-tight'>Payments</h1>
        <p className='text-muted-foreground text-sm'>
          Track inflows, refunds, and settlements across properties.
        </p>
      </div>
      <Button onClick={props.onNew}>
        <CreditCard className='mr-2 h-4 w-4' />
        New Payment
      </Button>
    </div>
  )
}
