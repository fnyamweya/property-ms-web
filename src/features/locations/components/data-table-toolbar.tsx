import type { Table } from '@tanstack/react-table'
import { LocationToolbar } from './location-toolbar'

/**
 * Wrapper component used by the generic locations data table. This
 * component simply forwards props to the `LocationToolbar` to maintain
 * parity with the naming convention used in the tasks feature. See
 * `LocationToolbar` for implementation details.
 */
export function DataTableToolbar<TData>({
  table,
}: {
  table: Table<TData>
}) {
  return <LocationToolbar table={table} />
}