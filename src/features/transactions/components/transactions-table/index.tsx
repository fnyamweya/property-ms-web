'use client'

import { flexRender } from '@tanstack/react-table'
import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'
import { useInteractiveTable } from '@/hooks/useInteractiveTable'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { columns } from './columns'
import { DataTablePagination } from './pagination'
import { Transaction } from './types'

interface TransactionsTableProps {
  data: Transaction[]
  isLoading?: boolean
  error?: Error | null
}

export function TransactionsTable({
  data,
  isLoading,
  error,
}: TransactionsTableProps) {
  const { table } = useInteractiveTable<Transaction>({
    initialData: data,
    columns,
    getRowId: (row) => String(row.id),
  })

  if (isLoading) {
    return <TableSkeleton columns={columns.length} />
  }

  if (error) {
    return (
      <div className='border-destructive/50 bg-destructive/10 flex h-48 items-center justify-center rounded-lg border p-4'>
        <p className='text-destructive'>
          Failed to load transactions: {error.message}
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Input
          placeholder='Filter transactions...'
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='max-w-sm'
        />
      </div>
      <div className='overflow-auto rounded-lg border'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = header.column
                  const canSort = column.getCanSort()
                  const isSorted = column.getIsSorted()

                  const SortIcon =
                    isSorted === 'asc'
                      ? IconSortAscending
                      : isSorted === 'desc'
                        ? IconSortDescending
                        : IconArrowsSort

                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            canSort
                              ? 'flex cursor-pointer items-center gap-2 select-none'
                              : ''
                          }
                          onClick={column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            column.columnDef.header,
                            header.getContext()
                          )}
                          {canSort && (
                            <SortIcon className='text-muted-foreground/70 h-4 w-4' />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
