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
import { PasswordInput } from '@/components/password-input'
import { cn } from '@/lib/utils'

const accountSchema = z.object({
  firstName: z.string().min(1, 'Your first name'),
  lastName: z.string().min(1, 'Your last name'),
  phone: z.string().min(7, 'Enter a valid phone'),
  email: z.string().email('Enter a valid email'),
  credential: z.string().min(7, 'At least 7 characters'),
})

const orgSchema = z.object({
  orgName: z.string().min(2, 'Organization name'),
})

type AccountValues = z.infer<typeof accountSchema>
type OrgValues = z.infer<typeof orgSchema>

type ApiEnvelope<T> = { data?: T } & Record<string, any>

async function postJson<T=any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) {
    throw new Error(text || `HTTP ${res.status}`)
  }
  try {
    const json = JSON.parse(text) as ApiEnvelope<T> | T
    // Accept both envelope and raw object shapes
    return (json as any)?.data ?? (json as any)
  } catch {
    return text as any
  }
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: 'Account' },
    { n: 2, label: 'Organization' },
    { n: 3, label: 'Done' },
  ] as const
  return (
    <div className='mb-4 flex items-center gap-3 text-sm'>
      {items.map((it, i) => (
        <React.Fragment key={it.n}>
          <div
            className={cn(
              'h-7 rounded-full px-3 inline-flex items-center justify-center border',
              step === it.n ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            <span className='font-medium'>{it.n}. {it.label}</span>
          </div>
          {i < items.length - 1 && <div className='h-px w-6 bg-muted-foreground/30' />}
        </React.Fragment>
      ))}
    </div>
  )
}

export function SignUpWizard() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [orgId, setOrgId] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

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

  async function handleAccount(values: AccountValues) {
    setSubmitting(true); setError(null)
    try {
      const created = await postJson<any>('/users', values)
      const id = (created?.id) ?? created?.user?.id ?? created?.data?.id
      if (!id) throw new Error('User ID missing in response')
      setUserId(id)
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
      const org = await postJson<any>('/organizations', { name: values.orgName })
      const oid = org?.id ?? org?.organization?.id ?? org?.data?.id
      if (!oid) throw new Error('Organization ID missing in response')
      setOrgId(oid)
      // membership
      await postJson<any>(`/organizations/${oid}/users`, {
        userId,
        organizationId: oid,
        roles: ['owner'],
      })
      setStep(3)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create organization or membership')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Stepper step={step} />
      {error && <p className='text-destructive mb-2 text-sm'>{error}</p>}

      {step === 1 && (
        <Form {...accountForm}>
          <form className='grid gap-3' onSubmit={accountForm.handleSubmit(handleAccount)}>
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
            <Button className='mt-2' disabled={submitting}>{submitting ? 'Creating…' : 'Create account'}</Button>
            <CardDescription className='mt-1'>
              You’ll verify your account after setting up your organization.
            </CardDescription>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...orgForm}>
          <form className='grid gap-3' onSubmit={orgForm.handleSubmit(handleOrganization)}>
            <FormField control={orgForm.control} name='orgName' render={({ field }) => (
              <FormItem><FormLabel>Organization name</FormLabel><FormControl><Input placeholder='e.g., Real Estate Organization' {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button className='mt-2' disabled={submitting}>{submitting ? 'Saving…' : 'Create & continue'}</Button>
          </form>
        </Form>
      )}

      {step === 3 && (
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>All set!</h3>
          <p className='text-muted-foreground text-sm'>
            Your account and organization are ready. You’ve been added as an <b>owner</b>.
          </p>
          <div className='pt-1'>
            <Button asChild><a href='/'>Go to dashboard</a></Button>
          </div>
        </div>
      )}
    </div>
  )
}
