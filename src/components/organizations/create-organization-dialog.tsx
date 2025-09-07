'use client'

import * as React from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateOrganization } from '@/hooks/useCreateOrganization'
import { useAuth } from '@/hooks/useAuth'
import { parseJwt } from '@/utils/jwt'
import { useOrganizationsStore } from '@/store/organizations'

const orgSchema = z.object({
  name: z.string().min(2, 'Organization name'),
})

type OrgValues = z.infer<typeof orgSchema>

export function CreateOrganizationDialog({
  open,
  onOpenChange,
  onCreated,
  persistent = true,
}: {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onCreated?: (org: { id: string; name: string }) => void
  persistent?: boolean
}) {
  const form = useForm<OrgValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: { name: '' },
  })
  const { mutate, status, error, created } = useCreateOrganization()
  const { user, accessToken, appendOrganization } = useAuth()
  const addMember = useOrganizationsStore((s) => s.addMember)

  // Call onCreated exactly once per successful creation
  const notifiedRef = React.useRef(false)
  const onCreatedRef = React.useRef(onCreated)
  React.useEffect(() => {
    onCreatedRef.current = onCreated
  }, [onCreated])
  React.useEffect(() => {
    if (created && !notifiedRef.current) {
      notifiedRef.current = true
      onCreatedRef.current?.(created)
    }
  }, [created])

  const handleSubmit = async (values: OrgValues) => {
    const org = await mutate({ name: values.name })
    // If backend does not auto-associate, add membership here
    const userId =
      (user as any)?.id ||
      (user as any)?.sub ||
      (accessToken ? (parseJwt<{ sub?: string }>(accessToken)?.sub ?? undefined) : undefined)
    if (org && userId) {
      await addMember({ organizationId: org.id, userId, roles: ['owner'] })
      // update local auth user organizations immediately
      appendOrganization({ id: org.id, name: org.name, plan: null, logoUrl: null })
    }
    // Attempt to close locally if allowed
    onOpenChange?.(false)
  }

  const canClose = !persistent || !!created

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (canClose) onOpenChange?.(next)
        // ignore close attempts when persistent and not created
      }}
      modal
    >
      <DialogContent showCloseButton={canClose}>
        <DialogHeader>
          <DialogTitle>Create an organization</DialogTitle>
          <DialogDescription>
            You don’t belong to any organization yet. Create one to continue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className='grid gap-3' onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., Acme Realty' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className='text-destructive text-sm'>{String(error)}</p>
            )}
            <DialogFooter>
              <Button type='submit' disabled={status === 'loading'}>
                {status === 'loading' ? 'Creating…' : 'Create organization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
