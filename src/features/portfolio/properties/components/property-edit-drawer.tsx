'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { usePropertiesStore } from '@/store/properties'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  propertyType: z.enum(['Residential', 'Commercial', 'MixedUse', 'Land']).optional(),
  isListed: z.boolean().default(false).optional(),
  description: z.string().optional().or(z.literal('')),
})

type Values = z.infer<typeof schema>

export function PropertyEditDrawer({
  open,
  onOpenChange,
  property,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: { id: string; name: string; propertyType?: string; isListed?: boolean; description?: string | null }
}) {
  const { updateProperty, updateStatus } = usePropertiesStore(
    useShallow((s) => ({ updateProperty: s.updateProperty, updateStatus: s.updateStatus }))
  )

  const form = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: property.name ?? '',
      propertyType: (property.propertyType as any) ?? 'Residential',
      isListed: Boolean(property.isListed),
      description: property.description ?? '',
    },
  })

  // Keep in sync when property changes
  const pid = property.id
  React.useEffect(() => {
    form.reset({
      name: property.name ?? '',
      propertyType: (property.propertyType as any) ?? 'Residential',
      isListed: Boolean(property.isListed),
      description: property.description ?? '',
    })
  }, [pid])

  async function onSubmit(values: Values) {
    try {
      await updateProperty(property.id, {
        name: values.name,
        propertyType: values.propertyType as any,
        isListed: values.isListed,
        description: values.description,
      } as any)
      toast.success('Property updated')
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Failed to update property', { description: String(err?.message ?? 'Unknown error') })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit property</SheetTitle>
          <SheetDescription>Update the property details.</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <Form {...form}>
            <form onSubmit={(form.handleSubmit as any)(onSubmit)} className="space-y-4">
              <FormField
                control={(form as any).control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nyari Heights" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={(form as any).control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value as any} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="MixedUse">Mixed-use</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={(form as any).control}
                name="isListed"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <FormLabel>Listed</FormLabel>
                      <p className="text-muted-foreground text-xs">Visible in listings and search.</p>
                    </div>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={(form as any).control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Short note (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="submit" disabled={updateStatus === 'loading'}>
                  {updateStatus === 'loading' ? 'Saving…' : 'Save changes'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
