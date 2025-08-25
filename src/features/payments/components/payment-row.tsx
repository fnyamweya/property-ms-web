'use client'

import { Eye, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Payment } from '../types'

const statusClass: Record<Payment['status'], string> = {
  Completed:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  Pending:
    'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
  Failed:
    'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
  Refunded:
    'border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400',
}

export function PaymentRow({
  p,
  onView,
  onRefund,
}: {
  p: Payment
  onView: (p: Payment) => void
  onRefund: (p: Payment) => void
}) {
  return (
    <tr className='hover:bg-muted/50'>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>
        {p.createdAt.toLocaleDateString('en-KE', {
          day: '2-digit',
          month: 'short',
        })}
      </td>
      <td className='px-3 py-2'>
        <div className='text-sm font-medium'>{p.tenantName}</div>
        <div className='text-muted-foreground text-xs'>
          {p.unit} · {p.propertyName}
        </div>
      </td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>{p.reference}</td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>{p.method}</td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>{p.direction}</td>
      <td className='px-3 py-2 text-sm font-semibold whitespace-nowrap'>
        {p.currency} {p.amount.toLocaleString('en-KE')}
      </td>
      <td className='px-3 py-2 whitespace-nowrap'>
        <Badge className={statusClass[p.status]}>{p.status}</Badge>
      </td>
      <td className='px-3 py-2 text-right whitespace-nowrap'>
        <Button
          size='icon'
          variant='ghost'
          onClick={() => onView(p)}
          aria-label='View'
        >
          <Eye className='h-4 w-4' />
        </Button>
        {p.status === 'Completed' && (
          <Button
            size='icon'
            variant='ghost'
            onClick={() => onRefund(p)}
            aria-label='Refund'
          >
            <RotateCcw className='h-4 w-4' />
          </Button>
        )}
      </td>
    </tr>
  )
}
