"use client"

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUnitLeasesQuery } from '@/hooks/queries/useUnitLeasesQuery'
import { CommandUserPicker, type UserOption } from '@/components/command-user-picker'
import { TenantCreateDrawer } from '@/components/tenant-create-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useMutateLease } from '@/hooks/useMutateLease'
import { toast } from 'sonner'
import { apiClient } from '@/api'
import { ENDPOINTS } from '@/constants/endpoints'
import { useOrganizationsStore } from '@/store/organizations'

const LEASE_TYPES = [
  { value: 'fixed_term', label: 'Fixed term' },
  { value: 'periodic', label: 'Periodic' },
]
const CHARGE_TYPES = [
  { value: 'RENT', label: 'Rent' },
  { value: 'SERVICE_CHARGE', label: 'Service charge' },
  { value: 'OTHER', label: 'Other' },
]
const CHARGE_FREQUENCIES = [
  { value: 'one_off', label: 'One-off' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]
const PAYMENT_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

const schema = z.object({
  leaseType: z.string().optional(),
  amount: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().positive().optional()),
  paymentFrequency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  firstPaymentDate: z.string().optional(),
  tenantId: z.string().uuid('Enter a valid tenant id').optional(),
})

type Values = z.infer<typeof schema>

export function UnitLeaseDrawer({ open, onOpenChange, pid, uid, unitNumber, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; pid: string; uid: string; unitNumber?: string; onSaved?: () => void }) {
  const { data: leases = [], isLoading, refetch } = useUnitLeasesQuery(pid, uid)
  const organizationId = useOrganizationsStore((s) => s.selectedId)
  const current = React.useMemo(() => {
    if (!Array.isArray(leases) || leases.length === 0) return undefined as any
    const active = (leases as any).find((l: any) => (l.status ?? '').toLowerCase() === 'active')
    if (active) return active
    const now = new Date()
    const future = (leases as any).find((l: any) => (l.endDate ? new Date(l.endDate) : now) > now)
    return future ?? (leases as any)[0]
  }, [leases])
  const { createUnitLease, updateLease } = useMutateLease()
  const [createTenantOpen, setCreateTenantOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<UserOption | undefined>(undefined)

  type LeaseCharge = { type: 'RENT' | 'SERVICE_CHARGE' | 'OTHER'; name?: string; amount?: number; currency?: string; frequency?: string }
  const [charges, setCharges] = React.useState<LeaseCharge[]>([])

  const form = useForm<Values>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      leaseType: String((current as any)?.leaseType ?? (current as any)?.type ?? '').toLowerCase(),
      amount: current?.amount ?? (current as any)?.rentAmount ?? undefined,
      paymentFrequency: String((current as any)?.paymentFrequency ?? 'monthly').toLowerCase(),
      startDate: current?.startDate ?? '',
      endDate: current?.endDate ?? '',
      tenantId: (current as any)?.tenantId ?? undefined,
    },
  })

  // Watch critical fields so the Create button re-evaluates as user inputs values
  const wTenantId = form.watch('tenantId')
  const wStart = form.watch('startDate')
  const wEnd = form.watch('endDate')
  const wAmount = form.watch('amount')

  React.useEffect(() => {
    form.reset({
      leaseType: String((current as any)?.leaseType ?? (current as any)?.type ?? '').toLowerCase(),
      amount: (current?.amount ?? (current as any)?.rentAmount) as any,
      paymentFrequency: String((current as any)?.paymentFrequency ?? 'monthly').toLowerCase(),
      startDate: current?.startDate ?? '',
      endDate: current?.endDate ?? '',
      tenantId: (current as any)?.tenantId ?? undefined,
    })
  }, [current])

  const onSubmit = async (values: Values) => {
    try {
      // Resolve unitId to a UUID if needed
      const isUuid = (s?: string) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
      let unitIdForApi: string = uid
      if (!isUuid(unitIdForApi) && unitNumber) {
        try {
          const byNo = await apiClient.request<any>({
            endpointKey: ENDPOINTS.GET_PROPERTY_UNIT_BY_NUMBER,
            method: 'GET',
            pathParams: { id: pid },
            queryParams: { unitNumber },
          })
          const u = (byNo as any)?.data ?? byNo
          if (u?.id && isUuid(u.id)) unitIdForApi = u.id
        } catch {}
      }

      const baseAmount = Number(values.amount ?? 0)
      const extraAmount = (charges || []).reduce((s, c) => s + Number(c.amount ?? 0), 0)
      const totalAmount = baseAmount + extraAmount

      if (current?.id) {
        await updateLease(
          pid,
          unitIdForApi,
          current.id,
          {
            amount: totalAmount,
            paymentFrequency: values.paymentFrequency ? String(values.paymentFrequency).toLowerCase() : undefined,
            startDate: values.startDate,
            endDate: values.endDate,
            terms: { noticePeriodDays: 30 },
            propertyId: pid,
            unitId: unitIdForApi,
          } as any
        )
        toast.success('Lease updated')
      } else {
        // basic validation before create
        if (!values.tenantId || !values.startDate || !values.endDate || !(values.amount && values.amount > 0)) {
          toast.error('Please fill tenant, dates and a positive rent amount.')
          return
        }
        // Pre-submit safety: ensure we have a Unit Tenancy id, not a bare user id.
        let tenantIdForApi: string = values.tenantId
        const looksLikeUser = selectedUser && values.tenantId === selectedUser.id
        if (looksLikeUser) {
          try {
            const resEnsure = await apiClient.request<any>({
              endpointKey: ENDPOINTS.CREATE_TENANT_WITH_USER,
              method: 'POST',
              pathParams: { propertyId: pid, unitId: unitIdForApi },
              body: {
                user: {
                  firstName: selectedUser.firstName,
                  lastName: selectedUser.lastName,
                  email: selectedUser.email,
                  phone: selectedUser.phone,
                },
              },
            })
            const ensurePayload = (resEnsure as any)?.data ?? resEnsure
            const ensuredId: string | undefined = ensurePayload?.id || ensurePayload?.tenantId || ensurePayload?.tenant?.id
            if (ensuredId) {
              tenantIdForApi = ensuredId
              form.setValue('tenantId', ensuredId, { shouldDirty: true })
            } else {
              toast.error('Could not resolve tenant id for lease')
              return
            }
          } catch (e: any) {
            toast.error('Failed to ensure tenant is linked to unit', { description: String(e?.message ?? 'Unknown error') })
            return
          }
        }
        await createUnitLease(pid, unitIdForApi, {
          unitId: unitIdForApi,
          tenantId: tenantIdForApi,
          organizationId: organizationId ?? undefined,
          paymentFrequency: values.paymentFrequency ? String(values.paymentFrequency).toLowerCase() : undefined,
          amount: totalAmount,
          startDate: values.startDate,
          endDate: values.endDate,
          // Contract terms
          terms: { noticePeriodDays: 30 },
        } as any)
        toast.success('Lease created')
      }
      await refetch()
      onOpenChange(false)
      onSaved?.()
    } catch (e: any) {
      toast.error('Failed to save lease', { description: String(e?.message ?? 'Unknown error') })
    }
  }

  const createMode = !current?.id
  const createDisabled = React.useMemo(() => {
    if (!createMode) return false
    return !wTenantId || !wStart || !wEnd || !(wAmount && Number(wAmount) > 0)
  }, [createMode, wTenantId, wStart, wEnd, wAmount])

  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const terminateLease = async () => {
    if (!current?.id) return
    try {
      const today = new Date().toISOString().slice(0, 10)
      await updateLease(pid, uid, current.id, { endDate: today, propertyId: pid, unitId: uid })
      toast.success('Lease terminated')
      await refetch()
      setConfirmOpen(false)
      onOpenChange(false)
      onSaved?.()
    } catch (e: any) {
      toast.error('Failed to terminate lease', { description: String(e?.message ?? "Unknown error") })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-3xl p-0 flex flex-col'>
        <SheetHeader className='px-6 pt-6'>
          <SheetTitle>{current?.id ? 'Manage Lease' : 'Create Lease'}</SheetTitle>
          { (current as any)?.nextDueDate && (<div className='text-[11px] text-muted-foreground'>Next Due: {new Date((current as any).nextDueDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</div>) }
        </SheetHeader>
        <div className='flex-1 overflow-y-auto px-6 pb-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Tenant */}
              <div className='rounded-md border p-4'>
                <div className='mb-3 text-sm font-medium'>Tenant</div>
                <FormField
                  control={form.control}
                  name='tenantId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant (search users)</FormLabel>
                      <div className='flex items-start gap-2'>
                        <div className='grow'>
                          <FormControl>
                            <CommandUserPicker
                              value={field.value}
                              selectedUser={selectedUser}
                              onSelect={async (user?: UserOption) => {
                                try {
                                  if (!user) {
                                    setSelectedUser(undefined)
                                    field.onChange(undefined)
                                    return
                                  }
                                  setSelectedUser(user)
                                  const res = await apiClient.request<any>({
                                    endpointKey: ENDPOINTS.CREATE_TENANT_WITH_USER,
                                    method: 'POST',
                                    pathParams: { propertyId: pid, unitId: uid },
                                    body: {
                                      user: {
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                        phone: user.phone,
                                      },
                                    },
                                  })
                                  const payload = (res as any)?.data ?? res
                                  // Prefer UnitTenancy id (payload.id)
                                  const tid: string | undefined = payload?.id || payload?.tenantId || payload?.tenant?.id
                                  if (!tid) throw new Error('Tenant id missing after assignment')
                                  field.onChange(tid)
                                  toast.success('Tenant selected', { description: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() })
                                } catch (e: any) {
                                  setSelectedUser(undefined)
                                  field.onChange(undefined)
                                  toast.error('Failed to assign tenant', { description: String(e?.message ?? 'Unknown error') })
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                        <Button type='button' variant='secondary' onClick={() => setCreateTenantOpen(true)}>
                          Create tenant
                        </Button>
                      </div>
                      <div className='text-[11px] text-muted-foreground'>New tenants receive a 4-digit temporary code by SMS (expires in 30 minutes).</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Terms */}
              <div className='rounded-md border p-4'>
                <div className='mb-3 text-sm font-medium'>Lease Terms</div>
                <FormField control={form.control} name='leaseType' render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder='Select lease type' /></SelectTrigger>
                        <SelectContent>
                          {LEASE_TYPES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className='grid grid-cols-2 gap-3'>
                  <FormField control={form.control} name='amount' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (KES)</FormLabel>
                      <FormControl><Input type='number' inputMode='numeric' placeholder='0' {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name='paymentFrequency' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Frequency</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder='Select frequency' /></SelectTrigger>
                          <SelectContent>
                            {PAYMENT_FREQUENCIES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className='text-[11px] text-muted-foreground mt-1'>Total includes additional charges listed below.</div>
                <div className='grid grid-cols-2 gap-3'>
                  <FormField control={form.control} name='startDate' render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl><Input type='date' {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name='endDate' render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl><Input type='date' {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name='firstPaymentDate' render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Payment Date</FormLabel>
                    <FormControl><Input type='date' {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Extra Charges */}
              <div className='rounded-md border p-4'>
                <div className='mb-3 flex items-center justify-between'>
                  <div className='text-sm font-medium'>Additional Charges</div>
                  <Button type='button' size='sm' variant='secondary' onClick={() => setCharges([...(charges || []), { type: 'SERVICE_CHARGE', amount: 0, currency: 'KES', frequency: 'monthly' }])}>+ Add</Button>
                </div>
                <div className='space-y-3'>
                  {(charges || []).map((c, i) => (
                    <div key={i} className='grid grid-cols-[140px_1fr_140px_160px_40px] items-end gap-2'>
                      <div>
                        <label className='mb-1 block text-xs text-muted-foreground'>Type</label>
                        <Select value={c.type} onValueChange={(v) => setCharges(charges.map((r, idx) => idx === i ? { ...r, type: v as any } : r))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CHARGE_TYPES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className='mb-1 block text-xs text-muted-foreground'>Label (optional)</label>
                        <Input placeholder='e.g., Security, Water' value={c.name ?? ''} onChange={(e) => setCharges(charges.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))} />
                      </div>
                      <div>
                        <label className='mb-1 block text-xs text-muted-foreground'>Amount (KES)</label>
                        <Input type='number' inputMode='numeric' value={String(c.amount ?? '')} onChange={(e) => setCharges(charges.map((r, idx) => idx === i ? { ...r, amount: e.target.value === '' ? undefined : Number(e.target.value) } : r))} />
                      </div>
                      <div>
                        <label className='mb-1 block text-xs text-muted-foreground'>Frequency</label>
                        <Select value={c.frequency ?? 'monthly'} onValueChange={(v) => setCharges(charges.map((r, idx) => idx === i ? { ...r, frequency: v } : r))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CHARGE_FREQUENCIES.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Button type='button' variant='outline' onClick={() => setCharges(charges.filter((_, idx) => idx !== i))}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  {(!charges || charges.length === 0) && (
                    <div className='text-xs text-muted-foreground'>No additional charges.</div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className='rounded-md border p-4'>
                <div className='mb-3 text-sm font-medium'>Summary</div>
                {(() => {
                  const base = Number(form.getValues().amount ?? 0)
                  const extra = (charges || []).reduce((s, c) => s + Number(c.amount ?? 0), 0)
                  const total = base + extra
                  const freqRaw = form.getValues().paymentFrequency ?? 'monthly'
                  const freq = String(freqRaw).toLowerCase()
                  return (
                    <div className='grid gap-2 text-sm'>
                      <div className='flex items-center justify-between'><span>Base Amount</span><span>KES {base.toLocaleString('en-KE')}</span></div>
                      <div className='flex items-center justify-between'><span>Additional Charges</span><span>KES {extra.toLocaleString('en-KE')}</span></div>
                      <div className='mt-2 flex items-center justify-between text-base font-semibold'>
                        <span>Total submitted ({freq})</span>
                        <span>KES {total.toLocaleString('en-KE')}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <SheetFooter className='p-0'>
                <Button type='submit' disabled={isLoading || createDisabled}>{current?.id ? 'Save' : 'Create'}</Button>
                {current?.id && (
                  <Button type='button' variant='destructive' onClick={() => setConfirmOpen(true)}>
                    Terminate lease
                  </Button>
                )}
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
      <TenantCreateDrawer
        open={createTenantOpen}
        onOpenChange={setCreateTenantOpen}
        onCreated={(t) => {
          if (t?.user) {
            const u = {
              id: t.user.id ?? '',
              firstName: t.user.firstName,
              lastName: t.user.lastName,
              email: t.user.email,
              phone: t.user.phone,
            }
            setSelectedUser(u)
            // Prefer user.id if tenant id missing
            const tid = t?.id || t?.user?.id || ''
            if (tid) form.setValue('tenantId', tid, { shouldDirty: true, shouldTouch: true })
          } else if (t?.id) {
            form.setValue('tenantId', t.id, { shouldDirty: true, shouldTouch: true })
          }
        }}
        propertyId={pid}
        unitId={uid}
      />
      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Terminate lease?" desc="This will end the current lease as of today." destructive handleConfirm={terminateLease} />
    </Sheet>
  )
}
