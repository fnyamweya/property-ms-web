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
import type { PropertyCreateValues } from '../types'

export function ContactOwnerFields({
  form,
}: {
  form: UseFormReturn<PropertyCreateValues>
}) {
  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-medium'>Owner / Contact (optional)</h3>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <FormField
          control={form.control}
          name='ownerName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Owner / Agent name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='ownerEmail'
          rules={{
            validate: (v) =>
              !v ||
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
              'Enter a valid email',
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='owner@company.com'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='ownerPhone'
          rules={{
            validate: (v) =>
              !v ||
              /^\+?[0-9]{7,15}$/.test(v) ||
              'Enter a valid phone (e.g. +2547...)',
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='+2547...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </section>
  )
}
