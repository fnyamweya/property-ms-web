import type { Table } from '@tanstack/react-table'
import { PropertyToolbar } from './property-toolbar'

/**
 * Wrapper around `PropertyToolbar` used by the generic DataTable. Keeps
 * naming consistent with other features such as tasks and locations.
 */
export function DataTableToolbar<TData>({ table }: { table: Table<TData> }) {
  return <PropertyToolbar table={table} />
}