'use client'

//
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { useOrganizationsStore } from '@/store/organizations'
import { usePropertiesStore } from '@/store/properties'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  propertyType: z.enum(['Residential', 'Commercial', 'MixedUse', 'Land']),
  isListed: z.boolean().default(false),
  description: z.string().optional(),
})

type Values = z.infer<typeof schema>

export function PropertyCreateDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const organizationId = useOrganizationsStore((s) => s.selectedId)
  const { createProperty, createStatus, fetchProperties } = usePropertiesStore(
    useShallow((s) => ({ createProperty: s.createProperty, createStatus: s.createStatus, fetchProperties: s.fetchProperties }))
  )
  const currentUserId = useAuthStore((s) => s.user?.id)

  const form = useForm<Values>({
    // Casting resolver to any to avoid overly strict generics mismatch
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', propertyType: 'Residential', isListed: false, description: '' },
  })

  async function onSubmit(values: Values) {
    if (!organizationId) {
      toast.error('Select an organization first')
      return
    }
    try {
      const created = await createProperty({
        name: values.name,
        propertyType: values.propertyType,
        isListed: values.isListed,
        description: values.description,
        organizationId,
        // ensure creator is owner
        // backend accepts either ownerId or owners[]; send both for compatibility
        ...(currentUserId ? { ownerId: currentUserId } : {}),
        ...(currentUserId ? { owners: [{ id: currentUserId, name: 'Owner' }] } : {}),
      } as any)
      toast.success('Property created', { description: created.name })
      onOpenChange(false)
      form.reset()
      await fetchProperties({ page: 1, limit: 100, organizationId })
    } catch (err: any) {
      toast.error('Failed to create property', { description: String(err?.message ?? 'Unknown error') })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create property</SheetTitle>
          <SheetDescription>Add a property under the current organization.</SheetDescription>
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
                    <Select value={field.value} onValueChange={field.onChange}>
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                <Button type="submit" disabled={createStatus === 'loading'}>
                  {createStatus === 'loading' ? 'Creating…' : 'Create property'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
