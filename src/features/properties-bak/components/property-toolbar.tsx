import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { propertyTypeOptions, statusOptions } from './property-filters'

interface PropertyToolbarProps<TData> {
  table: Table<TData>
}

/**
 * Toolbar for the properties table. Provides a search input bound to
 * the `name` column and faceted filters for property type and active
 * status. A reset button clears all active column filters, and the
 * view options menu allows toggling columns on and off.
 */
export function PropertyToolbar<TData>({ table }: PropertyToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Search properties…'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('propertyType') && (
            <DataTableFacetedFilter
              column={table.getColumn('propertyType')}
              title='Type'
              options={propertyTypeOptions}
            />
          )}
          {table.getColumn('isActive') && (
            <DataTableFacetedFilter
              column={table.getColumn('isActive')}
              title='Status'
              options={statusOptions}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}