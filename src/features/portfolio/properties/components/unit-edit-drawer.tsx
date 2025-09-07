'use client'

import * as React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { usePropertyUnits } from '@/hooks/usePropertyUnits'
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { MetadataEditor } from '@/components/metadata-editor'
import type { Property } from '../types'

// UI Unit type
type Unit = Property['units'][number]

const schema = z.object({
  unitNumber: z.string().min(1, 'Unit number'),
  name: z.string().optional(),
  isListed: z.boolean().default(false),
})

export function UnitEditDrawer({
  open,
  onOpenChange,
  pid,
  unit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pid: string
  unit: Unit | null
}) {
  const { updateUnit } = usePropertyUnits(pid)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      unitNumber: unit?.unitIdentifier ?? '',
      name: (unit as any)?.name ?? undefined,
      isListed: Boolean((unit as any)?.isListed ?? false),
    },
  })

  const [meta, setMeta] = React.useState<Record<string, unknown>>(
    ((unit as any)?.metadata ?? {}) as any
  )

  React.useEffect(() => {
    form.reset({
      unitNumber: unit?.unitIdentifier ?? '',
      name: (unit as any)?.name ?? undefined,
      isListed: Boolean((unit as any)?.isListed ?? false),
    })
    setMeta(((unit as any)?.metadata ?? {}) as any)
  }, [unit])

  function buildMetadataPatch(
    original: Record<string, any>,
    next: Record<string, any>
  ) {
    const patch: Record<string, any> = {}
    // Add/replace keys from next
    Object.keys(next || {}).forEach((k) => {
      const v = (next as any)[k]
      patch[k] = v
    })
    // Null out removed keys that existed originally
    Object.keys(original || {}).forEach((k) => {
      if (!(k in next)) {
        patch[k] = null
      }
    })
    // If patch is empty, return undefined to avoid sending metadata at all
    return Object.keys(patch).length ? patch : undefined
  }

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!unit) return
    try {
      const original = ((unit as any)?.metadata ?? {}) as Record<string, any>
      const nextMeta = meta && typeof meta === 'object' ? (meta as any) : {}
      const metadataPatch = buildMetadataPatch(original, nextMeta)

      await updateUnit(unit.id, {
        unitNumber: values.unitNumber,
        name: values.name,
        isListed: values.isListed,
        metadata: metadataPatch,
      } as any)
      toast.success('Unit updated', { description: `#${values.unitNumber}` })
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Failed to update unit', {
        description: String(e?.message ?? 'Unknown error'),
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-full sm:max-w-sm'>
        <SheetHeader>
          <SheetTitle>Edit Unit</SheetTitle>
        </SheetHeader>
        <div className='px-4'>
          <Form {...form}>
            <form onSubmit={(form.handleSubmit as any)(onSubmit)} className='space-y-4'>
              <FormField
                control={(form as any).control}
                name='unitNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit number</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., A-101' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={(form as any).control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., 2BR' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Common metadata fields surfaced individually for convenience */}
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                <div>
                  <label className='text-muted-foreground mb-1 block text-sm'>
                    Bedrooms
                  </label>
                  <Input
                    type='number'
                    value={(meta?.bedrooms ?? '') as any}
                    onChange={(e) =>
                      setMeta({
                        ...(meta ?? {}),
                        bedrooms:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='text-muted-foreground mb-1 block text-sm'>
                    Bathrooms
                  </label>
                  <Input
                    type='number'
                    value={(meta?.bathrooms ?? '') as any}
                    onChange={(e) =>
                      setMeta({
                        ...(meta ?? {}),
                        bathrooms:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='text-muted-foreground mb-1 block text-sm'>
                    Area (sq ft)
                  </label>
                  <Input
                    type='number'
                    value={(meta?.sizeSqFt ?? '') as any}
                    onChange={(e) =>
                      setMeta({
                        ...(meta ?? {}),
                        sizeSqFt:
                          e.target.value === ''
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className='text-muted-foreground mb-1 block text-sm'>
                    Meter number
                  </label>
                  <Input
                    value={(meta?.meterNumber ?? '') as any}
                    onChange={(e) =>
                      setMeta({
                        ...(meta ?? {}),
                        meterNumber:
                          e.target.value === '' ? undefined : e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className='text-muted-foreground mb-1 block text-sm'>
                    Parking
                  </label>
                  <Input
                    value={(meta?.parking ?? '') as any}
                    onChange={(e) =>
                      setMeta({
                        ...(meta ?? {}),
                        parking:
                          e.target.value === '' ? undefined : e.target.value,
                      })
                    }
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label className='text-muted-foreground mb-1 block text-sm'>
                    Notes
                  </label>
                  <Input
                    value={(meta?.notes ?? '') as any}
                    onChange={(e) =>
                      setMeta({
                        ...(meta ?? {}),
                        notes:
                          e.target.value === '' ? undefined : e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <MetadataEditor
                value={meta}
                onChange={setMeta}
                title='Metadata'
              />
              <FormField
                control={(form as any).control}
                name='isListed'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between rounded-md border p-3'>
                    <div>
                      <FormLabel>Listed</FormLabel>
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
              <SheetFooter>
                <Button type='submit'>Save changes</Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
