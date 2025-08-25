'use client'

import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BalanceRow as Row } from '../types'
import { formatMoney } from '../utils'

export function BalanceRow({
  r,
  onView,
}: {
  r: Row
  onView: (r: Row) => void
}) {
  const sign = r.balance >= 0 ? '' : '-'
  const kindCol =
    r.kind === 'AR'
      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400'
      : 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400'

  return (
    <tr className='hover:bg-muted/50'>
      <td className='px-3 py-2'>
        <div className='text-sm font-medium'>{r.entityName}</div>
        <div className='text-muted-foreground text-xs'>
          {r.unit} · {r.propertyName}
        </div>
      </td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>
        <Badge className={kindCol}>{r.kind}</Badge>
      </td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>
        {formatMoney(r.openingBalance, r.currency)}
      </td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>
        {formatMoney(r.totalDebits, r.currency)}
      </td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>
        {formatMoney(r.totalCredits, r.currency)}
      </td>
      <td className='px-3 py-2 text-sm font-semibold whitespace-nowrap'>
        {sign} {formatMoney(Math.abs(r.balance), r.currency)}
      </td>
      <td className='px-3 py-2 text-xs whitespace-nowrap'>
        {/* aging chips (if provided) */}
        <div className='flex gap-1'>
          {(['0-30', '31-60', '61-90', '90+'] as const).map((b) =>
            r.aging?.[b] ? (
              <Badge key={b} variant='outline'>
                {b}: {r.currency}{' '}
                {Math.round(r.aging[b]).toLocaleString('en-KE')}
              </Badge>
            ) : null
          )}
        </div>
      </td>
      <td className='px-3 py-2 text-right whitespace-nowrap'>
        <Button
          size='icon'
          variant='ghost'
          onClick={() => onView(r)}
          aria-label='View'
        >
          <Eye className='h-4 w-4' />
        </Button>
      </td>
    </tr>
  )
}
