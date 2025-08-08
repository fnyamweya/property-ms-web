import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PortfolioHeader() {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Property Portfolio
        </h1>
        <p className='text-muted-foreground'>
          An overview of all your managed properties.
        </p>
      </div>
      <Button>
        <PlusCircle className='mr-2 h-4 w-4' />
        Add New Property
      </Button>
    </div>
  )
}
