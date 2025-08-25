import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useProperties } from '../context/properties-context'

/**
 * Primary action buttons displayed at the top of the properties page. At
 * present there is only a single button to open the create property
 * drawer. Should additional actions be required (e.g. import),
 * replicate the pattern used in the tasks feature.
 */
export function PropertyPrimaryButtons() {
  const { setOpen } = useProperties()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('create')}
      >
        <span>Add Property</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}