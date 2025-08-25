'use client'

import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { AmenityPicker } from './amenity-picker'
import { ContactOwnerFields } from './contact-owner-fields'
import { LocationFields } from './location-fields'

export type PropertyCreateValues = {
  name: string
  propertyType: 'Residential' | 'Commercial' | 'MixedUse' | 'Land'
  unitsCount: number
  isActive: boolean
  country: string
  city: string
  addressLine1: string
  addressLine2?: string
  description?: string
  latitude?: number
  longitude?: number
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  amenities: string[]
  images?: any
}

const propertyCreateDefaults: PropertyCreateValues = {
  name: '',
  propertyType: 'Residential',
  unitsCount: 0,
  isActive: true,
  country: '',
  city: '',
  addressLine1: '',
  addressLine2: undefined,
  description: undefined,
  latitude: undefined,
  longitude: undefined,
  ownerName: undefined,
  ownerEmail: '',
  ownerPhone: undefined,
  amenities: [],
  images: undefined,
}

export function PropertyCreateForm() {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<PropertyCreateValues>({
    defaultValues: propertyCreateDefaults,
    mode: 'onChange',
  })

  const onSubmit: SubmitHandler<PropertyCreateValues> = async (values) => {
    setSubmitting(true)
    console.log('Form submitted:', values)
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Property ready to save', {
      description: 'API wiring comes next.',
    })
    form.reset(propertyCreateDefaults)
    setSubmitting(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Basics */}
        <section className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            }}
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>Property Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g. Nyari Heights Apartments'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='propertyType'
            rules={{ required: 'Type is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Residential'>Residential</SelectItem>
                    <SelectItem value='Commercial'>Commercial</SelectItem>
                    <SelectItem value='MixedUse'>Mixed-use</SelectItem>
                    <SelectItem value='Land'>Land</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='unitsCount'
            rules={{
              required: 'Units count is required',
              min: { value: 0, message: 'Must be zero or greater' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Units</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    inputMode='numeric'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='isActive'
            render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-md border p-3'>
                <div>
                  <FormLabel>Active</FormLabel>
                  <p className='text-muted-foreground text-xs'>
                    Toggle visibility in listings and search.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Short description, highlights, nearby landmarks…'
                    className='min-h-24'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Separator />

        {/* Location */}
        <LocationFields form={form} />

        <Separator />

        {/* Owner / Contact */}
        <ContactOwnerFields form={form} />

        <Separator />

        {/* Amenities */}
        <section className='grid grid-cols-1'>
          <AmenityPicker
            value={form.watch('amenities')}
            onChange={(v) =>
              form.setValue('amenities', v, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
          />
        </section>

        {/* Submit */}
        <div className='flex flex-col-reverse items-center justify-between gap-3 md:flex-row'>
          <p className='text-muted-foreground text-xs'>
            You can edit everything later.
          </p>
          <Button type='submit' disabled={submitting}>
            {submitting ? 'Reviewing…' : 'Save property'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
