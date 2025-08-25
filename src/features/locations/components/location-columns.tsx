import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { LocationRowActions } from './location-row-actions'
import type { Location } from './types'

/**
 * Column definitions for the locations table. Columns are defined as
 * constant values to avoid unnecessary re–creation on re–render. See
 * TanStack Table docs for details on the ColumnDef type. Each column
 * includes a header and cell renderer, and some have custom filter
 * functions to power the faceted filters. The final actions column
 * renders contextual controls for each row.
 */
export const columns: ColumnDef<Location>[] = [
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
  {
    accessorKey: 'localAreaName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Area Name' />
    ),
    cell: ({ row }) => {
      const value: string = row.getValue('localAreaName')
      return <span className='font-medium'>{value}</span>
    },
  },
  {
    accessorKey: 'county',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='County' />
    ),
    cell: ({ row }) => {
      const value: string = row.getValue('county')
      return <span>{value}</span>
    },
    filterFn: (row, id, value) => {
      // Accept rows where the county is in the selected filter array
      return (value as string[]).includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'town',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Town' />
    ),
    cell: ({ row }) => {
      const value: string | null = row.getValue('town')
      return <span>{value ?? '–'}</span>
    },
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'street',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Street' />
    ),
    cell: ({ row }) => {
      const value: string | null = row.getValue('street')
      return <span>{value ?? '–'}</span>
    },
  },
  {
    accessorKey: 'parent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Parent' />
    ),
    cell: ({ row }) => {
      const parent: Location['parent'] = row.getValue('parent')
      return <span>{parent?.localAreaName ?? '–'}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <LocationRowActions row={row} />, // actions column
  },
]