'use client'

import { Badge } from '@/components/ui/badge'

export function AgingLegend() {
  return (
    <div className='flex flex-wrap gap-2 text-xs'>
      <Badge variant='outline'>0–30</Badge>
      <Badge variant='outline'>31–60</Badge>
      <Badge variant='outline'>61–90</Badge>
      <Badge variant='outline'>90+</Badge>
    </div>
  )
}
