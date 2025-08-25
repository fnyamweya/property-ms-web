'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '../utils'

export function SummaryCards(props: {
  totalAR: number
  totalAP: number
  currencyLabel?: string
}) {
  const { totalAR, totalAP, currencyLabel = 'KES' } = props
  return (
    <div className='grid gap-3 sm:grid-cols-2'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Total Receivables (A/R)</CardTitle>
        </CardHeader>
        <CardContent className='text-2xl font-semibold'>
          {formatMoney(totalAR, currencyLabel)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Total Payables (A/P)</CardTitle>
        </CardHeader>
        <CardContent className='text-2xl font-semibold'>
          {formatMoney(Math.abs(totalAP), currencyLabel)}
        </CardContent>
      </Card>
    </div>
  )
}
