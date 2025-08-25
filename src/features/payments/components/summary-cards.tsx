'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SummaryCards(props: {
  totalIn: number
  totalOut: number
  count: number
  currencyLabel?: string
}) {
  const { totalIn, totalOut, count, currencyLabel = 'KES' } = props
  return (
    <div className='grid gap-3 sm:grid-cols-3'>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Total In</CardTitle>
        </CardHeader>
        <CardContent className='text-2xl font-semibold'>
          {currencyLabel} {totalIn.toLocaleString('en-KE')}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Total Out</CardTitle>
        </CardHeader>
        <CardContent className='text-2xl font-semibold'>
          {currencyLabel} {totalOut.toLocaleString('en-KE')}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>Transactions</CardTitle>
        </CardHeader>
        <CardContent className='text-2xl font-semibold'>{count}</CardContent>
      </Card>
    </div>
  )
}
