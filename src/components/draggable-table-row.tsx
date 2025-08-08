'use client'

import * as React from 'react'
import type { Row } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cva, type VariantProps } from 'class-variance-authority'
import { GripVertical } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'

const rowVariants = cva('', {
  variants: {
    isDragging: {
      true: 'bg-accent shadow-lg opacity-90',
    },
  },
})

export interface DraggableTableRowProps<T>
  extends VariantProps<typeof rowVariants> {
  row: Row<T>
  children: React.ReactNode
}

export function DraggableTableRow<T>({
  row,
  children,
}: DraggableTableRowProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'none',
    zIndex: isDragging ? 1 : 'auto',
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() ? 'selected' : undefined}
      className={rowVariants({ isDragging })}
    >
      <TableCell
        className='w-12 cursor-grab px-3'
        {...attributes}
        {...listeners}
      >
        <GripVertical className='text-muted-foreground/70 h-5 w-5' />
      </TableCell>

      {children}
    </TableRow>
  )
}
