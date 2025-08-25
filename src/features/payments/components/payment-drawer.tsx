'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { Payment } from '../types'

export function PaymentDrawer({
  open,
  onOpenChange,
  payment,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  payment: Payment | null
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>Payment Details</SheetTitle>
          <SheetDescription>{payment?.reference}</SheetDescription>
        </SheetHeader>

        {!payment ? null : (
          <div className='mt-4 space-y-3'>
            <div className='flex items-start justify-between'>
              <div>
                <div className='text-sm font-medium'>{payment.tenantName}</div>
                <div className='text-muted-foreground text-xs'>
                  {payment.unit} · {payment.propertyName}
                </div>
              </div>
              <Badge variant='outline'>{payment.status}</Badge>
            </div>

            <Separator />

            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div className='space-y-1'>
                <div className='text-muted-foreground text-xs'>Amount</div>
                <div className='font-semibold'>
                  {payment.currency} {payment.amount.toLocaleString('en-KE')}
                </div>
              </div>
              <div className='space-y-1'>
                <div className='text-muted-foreground text-xs'>Method</div>
                <div>{payment.method}</div>
              </div>
              <div className='space-y-1'>
                <div className='text-muted-foreground text-xs'>Direction</div>
                <div>{payment.direction}</div>
              </div>
              <div className='space-y-1'>
                <div className='text-muted-foreground text-xs'>Date</div>
                <div>{payment.createdAt.toLocaleString('en-KE')}</div>
              </div>
              {payment.invoiceId && (
                <div className='space-y-1'>
                  <div className='text-muted-foreground text-xs'>Invoice</div>
                  <div className='font-medium'>{payment.invoiceId}</div>
                </div>
              )}
            </div>

            {payment.notes && (
              <>
                <Separator />
                <div className='space-y-1 text-sm'>
                  <div className='text-muted-foreground text-xs'>Notes</div>
                  <div>{payment.notes}</div>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
