"use client"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'
import { useOrganizationsStore } from '@/store/organizations'
import { toast } from 'sonner'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number')
    .regex(/^[\d+\-()\s]+$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('').transform(() => undefined)),
})

type Values = z.infer<typeof schema>

export function TenantCreateDrawer({
  open,
  onOpenChange,
  onCreated,
  propertyId,
  unitId,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreated?: (tenant: { id?: string; name?: string; user?: { id?: string; firstName?: string; lastName?: string; email?: string; phone?: string } }) => void
  propertyId?: string
  unitId?: string
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: { firstName: '', lastName: '', phone: '', email: undefined },
  })
  // Keep selected organization cached in ApiClient; not needed directly here
  useOrganizationsStore()

  async function onSubmit(values: Values) {
    const credentialExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    try {
      if (!propertyId || !unitId) throw new Error('Missing propertyId or unitId')
      // Backend: creates/finds user, assigns tenant to unit, generates PIN, sends SMS
      const res = await apiClient.request<any>({
        endpointKey: ENDPOINTS.CREATE_TENANT_WITH_USER,
        method: 'POST',
        pathParams: { propertyId: String(propertyId), unitId: String(unitId) },
        body: {
          user: {
            firstName: values.firstName,
            lastName: values.lastName || undefined,
            phone: values.phone,
            email: values.email || undefined,
          },
          credentialExpiry,
        },
      })
      const payload = (res as any)?.data ?? res
      // Prefer UnitTenancy id from API (payload.id)
      const id: string | undefined = payload?.id || payload?.tenantId || payload?.tenant?.id
      const createdUser = payload?.user ?? undefined

      toast.success('Tenant created', { description: `${values.firstName} ${values.lastName || ''}`.trim() })
      onCreated?.({
        id,
        name: `${values.firstName} ${values.lastName || ''}`.trim(),
        user: createdUser ?? { firstName: values.firstName, lastName: values.lastName, email: values.email, phone: values.phone },
      })
      onOpenChange(false)
      form.reset({ firstName: '', lastName: '', phone: '', email: undefined })
    } catch (e: any) {
      toast.error('Failed to create tenant', { description: String(e?.message ?? 'Unknown error') })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-md p-0 flex flex-col'>
        <SheetHeader className='px-6 pt-6'>
          <SheetTitle>Create Tenant</SheetTitle>
          <SheetDescription>Invite a tenant by phone. A temporary credential is SMSed and expires in 30 minutes.</SheetDescription>
        </SheetHeader>
        <div className='flex-1 overflow-y-auto px-6 pb-4'>
          <Form {...form}>
            <form id='tenant-create-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <FormField control={(form as any).control} name='firstName' render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl><Input placeholder='e.g., Brian' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={(form as any).control} name='lastName' render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name (optional)</FormLabel>
                  <FormControl><Input placeholder='e.g., Otieno' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              </div>
              <FormField control={(form as any).control} name='phone' render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder='+2547…' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={(form as any).control} name='email' render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl><Input type='email' placeholder='you@example.com' {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className='h-2' />
            </form>
          </Form>
        </div>
        <SheetFooter className='px-6 pb-6'>
          <Button type='submit' form='tenant-create-form' className='w-full'>Create tenant</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
