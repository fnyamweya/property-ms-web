'use client'

import { ColumnDef } from '@tanstack/react-table'
import {
  IconCircleCheckFilled,
  IconCircle,
  IconLoader,
} from '@tabler/icons-react'
import { cva } from 'class-variance-authority'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Transaction } from './types'

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
})

const statusBadgeVariants = cva(
  'inline-flex items-center border-2 font-semibold capitalize',
  {
    variants: {
      status: {
        Completed:
          'border-green-200/80 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        Pending:
          'border-yellow-200/80 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
        Failed:
          'border-red-200/80 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      },
    },
  }
)

const StatusCell = ({ row }: { row: any }) => {
  const status = row.original.status as Transaction['status']
  const Icon = {
    Completed: <IconCircleCheckFilled className='mr-1.5 h-4 w-4' />,
    Pending: <IconLoader className='mr-1.5 h-4 w-4 animate-spin' />,
    Failed: <IconCircle className='mr-1.5 h-4 w-4' />,
  }[status]

  return (
    <Badge variant='outline' className={statusBadgeVariants({ status })}>
      {Icon}
      {status}
    </Badge>
  )
}

const ReviewerCell = ({ row }: { row: any }) => {
  const { reviewer } = row.original
  if (reviewer !== 'Assign reviewer') {
    return <span>{reviewer}</span>
  }
  return (
    <Select defaultValue=''>
      <SelectTrigger size='sm' className='w-36'>
        <SelectValue placeholder='Assign reviewer' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='Eddie Lake'>Eddie Lake</SelectItem>
        <SelectItem value='Jamik Tashpulatov'>Jamik Tashpulatov</SelectItem>
      </SelectContent>
    </Select>
  )
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: StatusCell,
  },
  {
    accessorKey: 'reviewer',
    header: 'Reviewer',
    cell: ReviewerCell,
  },
  {
    accessorKey: 'amount',
    header: () => <div className='text-right'>Amount</div>,
    cell: ({ row }) => (
      <div className='text-right font-medium'>
        {currencyFormatter.format(row.getValue('amount'))}
      </div>
    ),
  },
]
