'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CardDescription } from '@/components/ui/card'
import { ENDPOINTS } from '@/constants/endpoints'
import { apiClient } from '@/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Textarea } from '@/components/ui/textarea'
import { useNavigate } from '@tanstack/react-router'
import { PasswordInput } from '@/components/password-input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { useOrganizationsStore } from '@/store/organizations'

const accountSchema = z.object({
  firstName: z.string().min(1, 'Your first name'),
  lastName: z.string().min(1, 'Your last name'),
  phone: z.string().min(7, 'Enter a valid phone'),
  email: z.string().email('Enter a valid email'),
  credential: z.string().min(7, 'At least 7 characters'),
})

const orgSchema = z.object({ orgName: z.string().min(2, 'Organization name') })

const staffSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email('Valid email'),
      firstName: z.string().min(1, 'First name'),
      lastName: z.string().optional().or(z.literal('')),
      role: z.enum(['owner', 'caretaker', 'manager', 'accountant']).default('manager'),
    })
  ).default([]),
})

type AccountValues = z.infer<typeof accountSchema>
type OrgValues = z.infer<typeof orgSchema>
type StaffValues = z.infer<typeof staffSchema>

// type ApiEnvelope<T> = { data?: T } & Record<string, any>

// legacy helper retained for reference but unused after refactor
// function postJson<T=any>(url: string, body: any): Promise<T> { throw new Error('unused') }

function Stepper({ step, onGoto }: { step: 1 | 2 | 3 | 4; onGoto?: (s: 1 | 2 | 3 | 4) => void }) {
  const items = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'Organization' },
    { n: 3, label: 'Team' },
    { n: 4, label: 'Done' },
  ] as const
  return (
    <div className='mb-4 flex w-full items-center gap-2 overflow-x-auto text-sm'>
      {items.map((it, i) => (
        <React.Fragment key={it.n}>
          <button
            type='button'
            className={cn(
              'h-8 shrink-0 rounded-full px-3 inline-flex items-center justify-center border transition-colors',
              step === it.n
                ? 'bg-primary text-primary-foreground'
                : (it.n < step ? 'bg-muted hover:bg-muted/70 cursor-pointer' : 'bg-muted/60 cursor-default')
            )}
            onClick={() => { if (onGoto && it.n < step) onGoto(it.n as any) }}
          >
            <span className='font-medium'>{it.n}. {it.label}</span>
          </button>
          {i < items.length - 1 && <div className='hidden h-px w-6 bg-muted-foreground/30 sm:block' />}
        </React.Fragment>
      ))}
    </div>
  )
}

export function SignUpWizard() {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [orgId, setOrgId] = React.useState<string | null>(null)
  // const [propertyId, setPropertyId] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const navigate = useNavigate()

  // Step 1 — account
  const accountForm = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', email: '', credential: '' },
  })

  // Step 2 — organization
  const orgForm = useForm<OrgValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: { orgName: '' },
  })

  // Step 3 — staff invites
  const staffForm = useForm<StaffValues>({
    resolver: zodResolver(staffSchema) as any,
    defaultValues: { invites: [] },
  })

  async function handleAccount(values: AccountValues) {
    setSubmitting(true); setError(null)
    try {
      const created = await apiClient.request<any>({ endpointKey: ENDPOINTS.CREATE_USER, method: 'POST', body: values })
      const id = (created?.id) ?? created?.user?.id ?? created?.data?.id
      if (!id) throw new Error('User ID missing in response')
      setUserId(id)
      // Immediately authenticate so subsequent steps have a bearer token
      try {
        await useAuthStore.getState().login({ identifier: values.email, credential: values.credential })
      } catch (e: any) {
        // Surface login errors but don't lose the user creation context
        throw new Error(e?.message ?? 'Auto login failed')
      }
      setStep(2)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleOrganization(values: OrgValues) {
    if (!userId) { setError('User missing'); return }
    setSubmitting(true); setError(null)
    try {
      const org = await apiClient.request<any>({ endpointKey: ENDPOINTS.CREATE_ORGANIZATION, method: 'POST', body: { name: values.orgName } })
      const oid = org?.id ?? org?.organization?.id ?? org?.data?.id
      if (!oid) throw new Error('Organization ID missing in response')
      // membership
      await apiClient.request<any>({ endpointKey: ENDPOINTS.ADD_ORGANIZATION_MEMBER, method: 'POST', pathParams: { organizationId: oid }, body: { userId, roles: ['owner'] } })
      // Make this organization the active context immediately
      try {
        const orgStore = useOrganizationsStore.getState()
        await orgStore.fetchUserOrganizations(userId)
        orgStore.setSelected(oid)
      } catch {}
      setOrgId(oid)
      // Redirect to the organization dashboard (property management)
      navigate({ to: '/property-management' })
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create organization or membership')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStaff(values: StaffValues) {
    if (!orgId) { setError('Organization missing'); return }
    setSubmitting(true); setError(null)
    try {
      // Create users (if new) and add as org members with selected roles
      for (const inv of values.invites) {
        let uid: string | undefined
        try {
          const u = await apiClient.request<any>({ endpointKey: ENDPOINTS.CREATE_USER, method: 'POST', body: { email: inv.email, firstName: inv.firstName, lastName: inv.lastName ?? '' } })
          uid = u?.id ?? u?.data?.id
        } catch {}
        if (uid) {
          await apiClient.request<any>({ endpointKey: ENDPOINTS.ADD_ORGANIZATION_MEMBER, method: 'POST', pathParams: { organizationId: orgId }, body: { userId: uid, roles: [inv.role] } })
        }
      }
      setStep(4 as any)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to invite staff')
    } finally {
      setSubmitting(false)
    }
  }

  function goBack() { setStep((s) => (Math.max(1, (s as number) - 1) as any)) }

  return (
    <div>
      <Stepper step={step} onGoto={(s) => setStep(s)} />
      {error && <p className='text-destructive mb-2 text-sm'>{error}</p>}

      {step === 1 && (
        <Form {...accountForm}>
          <form className='grid gap-4' onSubmit={accountForm.handleSubmit(handleAccount)}>
            <div className='grid gap-3 md:grid-cols-2'>
              <FormField control={accountForm.control} name='firstName' render={({ field }) => (
                <FormItem><FormLabel>First name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={accountForm.control} name='lastName' render={({ field }) => (
                <FormItem><FormLabel>Last name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={accountForm.control} name='phone' render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder='0711 223344' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={accountForm.control} name='email' render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder='you@example.com' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={accountForm.control} name='credential' render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><PasswordInput placeholder='********' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button className='mt-2 h-10 text-base' disabled={submitting}>{submitting ? 'Creating…' : 'Create account'}</Button>
            <CardDescription className='mt-1'>
              You’ll verify your account after setting up your organization.
            </CardDescription>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...orgForm}>
          <form className='grid gap-4' onSubmit={orgForm.handleSubmit(handleOrganization)}>
            <FormField control={orgForm.control} name='orgName' render={({ field }) => (
              <FormItem><FormLabel>Organization name</FormLabel><FormControl><Input placeholder='e.g., Real Estate Organization' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className='flex items-center gap-2'>
              <Button className='h-10 text-base' disabled={submitting}>{submitting ? 'Saving…' : 'Create & continue'}</Button>
              <Button type='button' variant='ghost' onClick={goBack}>Back</Button>
            </div>
          </form>
        </Form>
      )}

      {step === 3 && (
        <Form {...staffForm}>
          <form className='grid gap-4' onSubmit={staffForm.handleSubmit(handleStaff)}>
            <div>
              <FormLabel>Invite team</FormLabel>
              <p className='text-muted-foreground text-xs'>Add a few teammates now or skip and do it later.</p>
            </div>
            {(staffForm.watch('invites') || []).map((inv, idx) => (
              <div key={idx} className='grid gap-3 md:grid-cols-[1fr_1fr_1fr_160px_80px]'>
                <Input placeholder='Email' value={inv.email} onChange={(e) => {
                  const arr = [...(staffForm.getValues('invites') || [])]
                  arr[idx] = { ...arr[idx], email: e.target.value }
                  staffForm.setValue('invites', arr as any, { shouldDirty: true })
                }} />
                <Input placeholder='First name' value={inv.firstName} onChange={(e) => {
                  const arr = [...(staffForm.getValues('invites') || [])]
                  arr[idx] = { ...arr[idx], firstName: e.target.value }
                  staffForm.setValue('invites', arr as any, { shouldDirty: true })
                }} />
                <Input placeholder='Last name' value={inv.lastName ?? ''} onChange={(e) => {
                  const arr = [...(staffForm.getValues('invites') || [])]
                  arr[idx] = { ...arr[idx], lastName: e.target.value }
                  staffForm.setValue('invites', arr as any, { shouldDirty: true })
                }} />
                <Select value={inv.role} onValueChange={(v) => {
                  const arr = [...(staffForm.getValues('invites') || [])]
                  arr[idx] = { ...arr[idx], role: v as any }
                  staffForm.setValue('invites', arr as any, { shouldDirty: true })
                }}>
                  <SelectTrigger><SelectValue placeholder='Role' /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value='owner'>Owner</SelectItem>
                    <SelectItem value='caretaker'>Caretaker</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                    <SelectItem value='accountant'>Accountant</SelectItem>
                  </SelectContent>
                </Select>
                <Button type='button' variant='outline' onClick={() => {
                  const arr = [...(staffForm.getValues('invites') || [])]
                  arr.splice(idx, 1)
                  staffForm.setValue('invites', arr as any, { shouldDirty: true })
                }}>Remove</Button>
              </div>
            ))}
            <div>
              <Button type='button' variant='secondary' onClick={() => staffForm.setValue('invites', [ ...(staffForm.getValues('invites') || []), { email: '', firstName: '', lastName: '', role: 'manager' } ], { shouldDirty: true })}>+ Add invite</Button>
            </div>
            <div className='flex items-center gap-2'>
              <Button className='h-10 text-base' type='submit' disabled={submitting}>{submitting ? 'Inviting…' : 'Finish onboarding'}</Button>
              <Button className='h-10 text-base' type='button' variant='ghost' onClick={() => setStep(4 as any)}>Skip</Button>
              <Button className='h-10 text-base' type='button' variant='ghost' onClick={goBack}>Back</Button>
            </div>
          </form>
        </Form>
      )}

      {step === 4 && (
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>All set!</h3>
          <p className='text-muted-foreground text-sm'>
            Your account, organization and first property are ready. You can invite more team members any time from Settings.
          </p>
          <div className='pt-1'>
            <Button asChild><a href='/'>Go to dashboard</a></Button>
          </div>
        </div>
      )}
    </div>
  )
}
