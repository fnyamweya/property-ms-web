import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { countyOptions, townOptions } from './location-filters'

interface LocationToolbarProps<TData> {
  table: Table<TData>
}

/**
 * Toolbar for the locations table. Includes a search input scoped to
 * the `localAreaName` column and faceted filters for county and town. A
 * reset button clears all active column filters. Column toggles are
 * provided via the view options menu.
 */
export function LocationToolbar<TData>({ table }: LocationToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Search location…'
          value={(table.getColumn('localAreaName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('localAreaName')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('county') && (
            <DataTableFacetedFilter
              column={table.getColumn('county')}
              title='County'
              options={countyOptions}
            />
          )}
          {table.getColumn('town') && (
            <DataTableFacetedFilter
              column={table.getColumn('town')}
              title='Town'
              options={townOptions}
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