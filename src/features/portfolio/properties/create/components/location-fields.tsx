'use client'

import type { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { PropertyCreateValues } from '../types'

export function LocationFields({
  form,
}: {
  form: UseFormReturn<PropertyCreateValues>
}) {
  return (
    <section className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Location</h3>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='country'
          rules={{ required: 'Country is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder='Kenya' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='city'
          rules={{ required: 'City/Town is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City / Town</FormLabel>
              <FormControl>
                <Input placeholder='Nairobi' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='addressLine1'
          rules={{ required: 'Address is required' }}
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder='Argwings Kodhek Rd, Kilimani' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='addressLine2'
          render={({ field }) => (
            <FormItem className='md:col-span-2'>
              <FormLabel>Address 2 (optional)</FormLabel>
              <FormControl>
                <Input placeholder='Apartment / Suite / Landmark' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='latitude'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude (optional)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='any'
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='longitude'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude (optional)</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='any'
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v === '' ? undefined : Number(v))
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator />
    </section>
  )
}
