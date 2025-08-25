'use client'

import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { BalanceRow } from '../types'
import { formatMoney } from '../utils'

export function BalanceDrawer({
  open,
  onOpenChange,
  row,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  row: BalanceRow | null
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>Ledger Details</SheetTitle>
          <SheetDescription>
            {row?.entityName} · {row?.unit} · {row?.propertyName}
          </SheetDescription>
        </SheetHeader>

        {!row ? null : (
          <div className='mt-4 space-y-3'>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <div className='text-muted-foreground text-xs'>Type</div>
                <div className='font-medium'>{row.kind}</div>
              </div>
              <div>
                <div className='text-muted-foreground text-xs'>Balance</div>
                <div className='font-semibold'>
                  {formatMoney(row.balance, row.currency)}
                </div>
              </div>
            </div>

            <Separator />

            <div className='rounded-md border'>
              <div className='text-muted-foreground grid grid-cols-5 border-b px-3 py-2 text-xs'>
                <div>Date</div>
                <div>Ref</div>
                <div className='col-span-2'>Description</div>
                <div className='text-right'>Δ</div>
              </div>
              <div className='max-h-[50vh] overflow-auto text-sm'>
                {row.ledger.map((t) => {
                  const delta = t.debit - t.credit
                  const sign = delta >= 0 ? '+' : '-'
                  return (
                    <div
                      key={t.id}
                      className='hover:bg-muted/40 grid grid-cols-5 px-3 py-2'
                    >
                      <div>
                        {t.date.toLocaleDateString('en-KE', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                      <div>{t.reference}</div>
                      <div className='col-span-2 truncate'>
                        {t.description ?? '-'}
                      </div>
                      <div className='text-right'>
                        {sign} {t.currency}{' '}
                        {Math.abs(delta).toLocaleString('en-KE')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
