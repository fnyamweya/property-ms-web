import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useLocations } from '../context/locations-context'

/**
 * Buttons displayed at the top of the locations page. Provides quick
 * access to the import flow and the create location drawer. Reuses
 * Tabler icons for consistency with the rest of the dashboard.
 */
export function LocationPrimaryButtons() {
  const { setOpen } = useLocations()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('create')}
      >
        <span>Add Location</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}