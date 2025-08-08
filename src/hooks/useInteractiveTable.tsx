import { useState, useMemo, useCallback } from 'react'
import {
  useReactTable,
  ColumnDef,
  TableOptions,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from '@tanstack/react-table'
import {
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export interface UseInteractiveTableProps<T> {
  initialData?: T[]
  data?: T[]
  onDataChange?: (data: T[]) => void
  columns?: ColumnDef<T>[]
  getRowId?: (row: T) => string
  tableOptions?: Omit<
    TableOptions<T>,
    'data' | 'columns' | 'state' | 'getCoreRowModel'
  >
}

export function useInteractiveTable<T extends { id?: string | number }>({
  initialData = [],
  data: controlledData,
  onDataChange,
  columns = [],
  getRowId: getRowIdProp = (row) => String(row.id),
  tableOptions = {},
}: UseInteractiveTableProps<T>) {
  const getRowId = useCallback(getRowIdProp, [])

  const isControlled = controlledData !== undefined
  const [internalData, setInternalData] = useState<T[]>(() => initialData)
  const data = isControlled ? controlledData : internalData

  const setData = (updater: T[] | ((oldData: T[]) => T[])) => {
    if (isControlled) {
      const newValue =
        typeof updater === 'function'
          ? (updater as (oldData: T[]) => T[])(data)
          : updater
      onDataChange?.(newValue)
    } else {
      setInternalData(updater)
    }
  }

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable<T>({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...tableOptions,
  })

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const ids = useMemo<string[]>(() => data.map(getRowId), [data, getRowId])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setData((currentData) => {
        const oldIndex = currentData.findIndex(
          (item) => getRowId(item) === active.id
        )
        const newIndex = currentData.findIndex(
          (item) => getRowId(item) === over.id
        )
        return arrayMove(currentData, oldIndex, newIndex)
      })
    }
  }

  return { table, data, setData, sensors, ids, handleDragEnd }
}
