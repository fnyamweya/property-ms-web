'use client'

import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { callTypes } from '../data/data'
import { User } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<User>[] = [
  // Selection
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
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Full name (firstName + lastName)
  {
    id: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { firstName, lastName } = row.original
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      return <LongText className='max-w-36'>{fullName || '—'}</LongText>
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },

  // Email
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email') || '—'}</div>
    ),
  },

  // Phone
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone') || '—'}</div>,
    enableSorting: false,
  },

  // Status (badge with color from callTypes)
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = String(row.getValue('status') ?? '')
      const badgeColor =
        callTypes.get?.(status) ?? // supports either Map or plain obj via .get
        (typeof callTypes === 'object' ? (callTypes as any)[status] : undefined)

      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status || '—'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => value?.includes?.(row.getValue(id)),
    enableHiding: false,
    enableSorting: false,
  },

  // Created At
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const raw = row.getValue('createdAt') as string | undefined
      if (!raw) return <span>—</span>
      const d = new Date(raw)
      // Prefer locale-aware short datetime; tweak to taste
      return <span className='text-muted-foreground'>{d.toLocaleString()}</span>
    },
    meta: { className: 'min-w-[180px]' },
  },

  // Row actions
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
