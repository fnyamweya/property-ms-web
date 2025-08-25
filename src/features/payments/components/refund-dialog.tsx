'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { Payment } from '../types'

export function RefundDialog({
  open,
  onOpenChange,
  payment,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  payment: Payment | null
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund Payment</DialogTitle>
        </DialogHeader>
        {!payment ? null : (
          <div className='space-y-3'>
            <div className='text-sm'>
              {payment.currency} {payment.amount.toLocaleString('en-KE')} ·{' '}
              {payment.reference}
            </div>
            <Textarea
              placeholder='Reason for refund...'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={() => {
                  onConfirm(reason)
                  setReason('')
                  onOpenChange(false)
                }}
              >
                Confirm Refund
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
