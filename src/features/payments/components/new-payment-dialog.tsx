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
import type { PaymentMethod, Currency } from '../types'

export function NewPaymentDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (payload: {
    tenantName: string
    amount: number
    currency: Currency
    method: PaymentMethod
    reference: string
  }) => void
}) {
  const [tenantName, setTenantName] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [currency, setCurrency] = useState<Currency>('KES')
  const [method, setMethod] = useState<PaymentMethod>('Mpesa')
  const [reference, setReference] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <div className='grid gap-3'>
          <div className='grid gap-1.5'>
            <Label>Tenant</Label>
            <Input
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder='e.g. Brian Otieno'
            />
          </div>
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
          <div className='grid grid-cols-2 gap-3'>
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
            <div className='grid gap-1.5'>
              <Label>Method</Label>
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Mpesa'>Mpesa</SelectItem>
                  <SelectItem value='Card'>Card</SelectItem>
                  <SelectItem value='Bank'>Bank</SelectItem>
                  <SelectItem value='Cash'>Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid gap-1.5'>
            <Label>Reference</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder='e.g. MPESA-XXXX'
            />
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!tenantName || !amount || !reference) return
                onCreate({
                  tenantName,
                  amount: Number(amount),
                  currency,
                  method,
                  reference,
                })
                onOpenChange(false)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
