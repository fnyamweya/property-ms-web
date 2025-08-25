import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { PropertyRowActions } from './property-row-actions'
import type { Property } from '@/types/property'

/**
 * Column definitions for the properties table. Each column defines its
 * header, cell renderer and optional filter behaviour. The final
 * actions column renders the contextual dropdown for edit/delete. Note
 * that the status column stores booleans, which we convert to user
 * friendly labels in the cell.
 */
export const columns: ColumnDef<Property>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const value: string = row.getValue('name')
      return <span className='font-medium'>{value}</span>
    },
  },
  {
    accessorKey: 'propertyType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const value: string = row.getValue('propertyType')
      // Display MixedUse as Mixed Use for readability
      return <span>{value === 'MixedUse' ? 'Mixed Use' : value}</span>
    },
    filterFn: (row, id, value) => {
      return (value as string[]).includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'unitsCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Units' />
    ),
    cell: ({ row }) => {
      const value: number = row.getValue('unitsCount')
      return <span>{value}</span>
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const value: boolean = row.getValue('isActive')
      return <span>{value ? 'Active' : 'Inactive'}</span>
    },
    filterFn: (row, id, value) => {
      // value is array of strings 'true'/'false'
      const val = row.getValue(id) as boolean
      return (value as string[]).includes(String(val))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <PropertyRowActions row={row} />,
  },
]