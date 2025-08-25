'use client'

import * as React from 'react'
import { CreditCard, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Props = {
  pid: string
  uid: string
  unit: any
  onClose?: () => void
}

export function UnitPaymentsPanel({ pid, uid, unit, onClose }: Props) {
  const payments = (unit as any).payments ?? []

  const totalPaid = payments.reduce(
    (s: number, p: any) => s + (p.amount ?? 0),
    0
  )
  const monthly = unit.currentLeaseAmount ?? 0
  const balance = (unit as any).balance ?? monthly - totalPaid

  return (
    <div className='flex min-h-[60vh] flex-col gap-4'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <CreditCard className='h-4 w-4' />
          <span className='text-sm font-medium'>
            Payments • Unit #{unit.unitIdentifier}
          </span>
          <Badge variant='secondary'>
            Balance: KES {balance.toLocaleString('en-KE')}
          </Badge>
        </div>
        <Button
          size='sm'
          onClick={() => {
            /* open record payment modal */
          }}
        >
          <Plus className='mr-2 h-4 w-4' />
          Record Payment
        </Button>
      </div>

      <Separator />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Ref</TableHead>
            <TableHead className='text-right'>Amount (KES)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className='text-muted-foreground text-sm'>
                No payments yet.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.date
                    ? new Date(p.date).toLocaleDateString('en-KE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '—'}
                </TableCell>
                <TableCell>{p.method ?? '—'}</TableCell>
                <TableCell>{p.reference ?? '—'}</TableCell>
                <TableCell className='text-right'>
                  {(p.amount ?? 0).toLocaleString('en-KE')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className='mt-2 flex justify-end'>
        <Button variant='ghost' onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
