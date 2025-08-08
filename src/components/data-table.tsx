'use client'

import * as React from 'react'
import {
  flexRender,
  type ColumnDef,
  type Table as TanStackTable,
} from '@tanstack/react-table'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import {
  UseInteractiveTableProps,
  useInteractiveTable,
} from '@/hooks/useInteractiveTable'
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter,
} from '@/components/ui/table'
import { DraggableTableRow } from './draggable-table-row'

type DataTableProps<T extends { id: string | number }> =
  UseInteractiveTableProps<T> & {
    columns: ColumnDef<T>[]
    caption?: string
    isDraggable?: boolean
    toolbarContent?:
      | React.ReactNode
      | ((table: TanStackTable<T>) => React.ReactNode)
    footerContent?:
      | React.ReactNode
      | ((table: TanStackTable<T>) => React.ReactNode)
  }

export function DataTable<T extends { id: string | number }>({
  columns,
  caption,
  isDraggable = false,
  toolbarContent,
  footerContent,
  ...hookProps
}: DataTableProps<T>) {
  const { table, sensors, ids, handleDragEnd } = useInteractiveTable<T>({
    ...hookProps,
    columns,
  })

  const { getHeaderGroups, getRowModel } = table
  const headerGroups = getHeaderGroups()
  const rows = getRowModel().rows
  const totalColumns =
    table.getVisibleFlatColumns().length + (isDraggable ? 1 : 0)

  const renderSlot = (
    content: React.ReactNode | ((table: TanStackTable<T>) => React.ReactNode)
  ) => {
    return typeof content === 'function' ? content(table) : content
  }

  const TableBodyContent = (
    <TableBody className='divide-y'>
      {rows.length > 0 ? (
        rows.map((row) => {
          const cells = row
            .getVisibleCells()
            .map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))

          if (isDraggable) {
            return (
              <DraggableTableRow key={row.id} row={row}>
                {cells}
              </DraggableTableRow>
            )
          }

          return (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? 'selected' : undefined}
            >
              {cells}
            </TableRow>
          )
        })
      ) : (
        <TableRow>
          <TableCell colSpan={totalColumns} className='py-4 text-center'>
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )

  return (
    <div>
      {toolbarContent && (
        <div className='mb-4 flex items-center justify-between'>
          {renderSlot(toolbarContent)}
        </div>
      )}
      <div className='overflow-auto rounded-lg border'>
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader className='bg-muted sticky top-0 z-10'>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {isDraggable && <TableHead className='w-12' />}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {isDraggable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={ids}
                strategy={verticalListSortingStrategy}
              >
                {TableBodyContent}
              </SortableContext>
            </DndContext>
          ) : (
            TableBodyContent
          )}

          {footerContent && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={totalColumns}>
                  {renderSlot(footerContent)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  )
}
