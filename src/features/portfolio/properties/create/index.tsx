'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PropertyCreateForm } from '../../../../features/portfolio/properties/create/components/property-create-form'

export function CreatePropertyPage() {
  return (
    <div className='mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8'>
      <div className='mb-3'>
        <Button asChild variant='ghost' size='sm' className='gap-1 px-2'>
          <Link to='/properties/create'>
            <ArrowLeft className='h-4 w-4' />
            Back to properties
          </Link>
        </Button>
      </div>

      <Card className='border-muted'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-xl'>Add a new property</CardTitle>
          <p className='text-muted-foreground text-sm'>
            Capture the essentials now; you can refine details later.
          </p>
        </CardHeader>
        <Separator />
        <CardContent className='pt-6'>
          <PropertyCreateForm />
        </CardContent>
      </Card>
    </div>
  )
}
