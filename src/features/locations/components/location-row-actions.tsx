import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLocations } from '../context/locations-context'
import type { Location } from './types'

interface LocationRowActionsProps<TData> {
  row: Row<TData>
}

/**
 * Row actions dropdown for the locations table. Provides edit and
 * delete operations on a location. When invoked, the current row is
 * stored in context so that dialogs can access its data.
 */
export function LocationRowActions<TData>({ row }: LocationRowActionsProps<TData>) {
  // We assert that the row original matches our Location type. In a
  // strongly typed environment this would be enforced by the table's
  // generic parameters.
  const location = row.original as unknown as Location
  const { setOpen, setCurrentRow } = useLocations()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(location)
            setOpen('update')
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(location)
            setOpen('delete')
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}