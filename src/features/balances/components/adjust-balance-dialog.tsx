'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Currency, BalanceKind } from '../types'

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (payload: {
    entityName: string
    amount: number
    currency: Currency
    kind: BalanceKind
    reason?: string
  }) => void
}) {
  const [entityName, setEntity] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [currency, setCurrency] = useState<Currency>('KES')
  const [kind, setKind] = useState<BalanceKind>('AR')
  const [reason, setReason] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Balance</DialogTitle>
        </DialogHeader>
        <div className='grid gap-3'>
          <div className='grid gap-1.5'>
            <Label>Entity</Label>
            <Input
              value={entityName}
              onChange={(e) => setEntity(e.target.value)}
              placeholder='Tenant or Vendor name'
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='grid gap-1.5'>
              <Label>Amount</Label>
              <Input
                type='number'
                min={0}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : '')
                }
              />
            </div>
            <div className='grid gap-1.5'>
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(v: any) => setCurrency(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='KES'>KES</SelectItem>
                  <SelectItem value='USD'>USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid gap-1.5'>
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v: any) => setKind(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='AR'>Receivable (A/R)</SelectItem>
                <SelectItem value='AP'>Payable (A/P)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder='Explain why you are adjusting…'
            />
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!entityName || !amount) return
                onConfirm({
                  entityName,
                  amount: Number(amount),
                  currency,
                  kind,
                  reason,
                })
                onOpenChange(false)
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
