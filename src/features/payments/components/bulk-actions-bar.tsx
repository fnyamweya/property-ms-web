'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function BulkActionsBar({
  selectedCount,
  onExport,
  onMarkComplete,
  onClear,
}: {
  selectedCount: number
  onExport: () => void
  onMarkComplete: () => void
  onClear: () => void
}) {
  if (!selectedCount) return null
  return (
    <div className='bg-background/90 sticky top-0 z-10 mb-3 flex items-center justify-between rounded-md border p-2 backdrop-blur'>
      <div className='flex items-center gap-2 text-sm'>
        <Badge variant='secondary'>{selectedCount}</Badge>
        selected
      </div>
      <div className='flex items-center gap-2'>
        <Button size='sm' variant='outline' onClick={onExport}>
          Export CSV
        </Button>
        <Button size='sm' onClick={onMarkComplete}>
          Mark Completed
        </Button>
        <Button size='sm' variant='ghost' onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}
