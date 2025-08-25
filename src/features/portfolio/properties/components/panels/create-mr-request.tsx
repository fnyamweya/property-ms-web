'use client'

import * as React from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { Controller, useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Calendar as CalendarIcon,
  Loader2,
  Paperclip,
  Plus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
/* Side panel */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

export type Assignee = { id: string; name: string; email?: string }
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const
export type Priority = (typeof PRIORITIES)[number]

/** ——— Public input passed back to parent ——— */
export type CreateMRRequestInput = {
  title: string
  category: string
  priority: Priority
  description: string
  dueAt?: Date | null
  assigneeId?: string | null
  location?: string | null
  meterReading?: string | null
}

/** ——— Zod schema (aligns with CreateMRRequestInput) ——— */
const RequestSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(PRIORITIES),
  description: z.string(),
  dueAt: z.date().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  meterReading: z.string().nullable().optional(),
})

type RequestForm = z.infer<typeof RequestSchema>
type FormApi = UseFormReturn<RequestForm, any, RequestForm> // ✅ unify RHF generics

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pid: string
  uid: string
  unitIdentifier?: string
  assignees?: Assignee[]
  categories?: string[]
  onCreate: (payload: CreateMRRequestInput) => Promise<void> | void
}

/**
 * NOTE: same export name as before, but rendered as a side Sheet.
 */
export function CreateMRRequestDialog({
  open,
  onOpenChange,
  pid,
  uid,
  unitIdentifier,
  assignees = [],
  categories = [
    'General',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Structural',
    'Landscaping',
    'Security',
  ],
  onCreate,
}: Props) {
  const [submitting, setSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [previews, setPreviews] = React.useState<
    Array<{ id: string; file: File; url: string }>
  >([])

  // ✅ include the third generic so FormApi matches exactly
  const form = useForm<RequestForm, any, RequestForm>({
    resolver: zodResolver(RequestSchema),
    defaultValues: {
      title: '',
      category: categories[0] ?? 'General',
      priority: 'Normal',
      description: '',
      dueAt: undefined,
      assigneeId: undefined,
      location: '',
      meterReading: '',
    },
    mode: 'onChange',
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      const payload: CreateMRRequestInput = {
        title: values.title.trim(),
        category: values.category,
        priority: values.priority,
        description: (values.description ?? '').trim(),
        dueAt: values.dueAt ?? null,
        assigneeId: values.assigneeId ?? null,
        location: values.location ?? null,
        meterReading: values.meterReading ?? null,
      }
      await Promise.resolve(onCreate(payload))
      toast.success('Request created', {
        description: `“${payload.title}” for Unit ${unitIdentifier ? `#${unitIdentifier}` : ''}`,
      })
      form.reset()
      setPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url))
        return []
      })
      onOpenChange(false)
    } catch (err: any) {
      toast.error('Could not create request', {
        description: err?.message ?? 'Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  })

  const onPickFiles = (files: FileList | null) => {
    if (!files?.length) return
    const arr = Array.from(files)
    const newPreviews = arr.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
    }))
    setPreviews((p) => [...p, ...newPreviews])
  }

  const removeFile = (id: string) => {
    setPreviews((p) => {
      const toRemove = p.find((x) => x.id === id)
      if (toRemove) URL.revokeObjectURL(toRemove.url)
      return p.filter((x) => x.id !== id)
    })
  }

  React.useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url))
  }, [previews])

  return (
    <Sheet open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
      <SheetContent
        side='right'
        className='flex h-full w-full flex-col gap-0 p-0 sm:max-w-lg'
      >
        {/* Header */}
        <div className='border-b p-4'>
          <SheetHeader>
            <SheetTitle>Create Maintenance Request</SheetTitle>
            <SheetDescription>
              {unitIdentifier
                ? `Unit #${unitIdentifier}`
                : 'Create a new ticket to track an issue.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Body (scrollable) */}
        <ScrollArea className='flex-1'>
          <form id='mr-form' onSubmit={handleSubmit} className='space-y-4 p-4'>
            {/* Title */}
            <div className='grid gap-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                placeholder='e.g., Kitchen sink leaking'
                {...form.register('title')}
              />
              <FieldError name='title' form={form} />
            </div>

            {/* Category / Priority */}
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label>Category</Label>
                <Controller
                  name='category'
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError name='category' form={form} />
              </div>

              <div className='grid gap-2'>
                <Label>Priority</Label>
                <Controller
                  name='priority'
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select priority' />
                      </SelectTrigger>
                      <SelectContent>
                        {(['Low', 'Normal', 'High', 'Urgent'] as const).map(
                          (p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Due date / Assignee */}
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label>Due date (optional)</Label>
                <Controller
                  name='dueAt'
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {field.value
                            ? format(field.value, 'dd MMM yyyy')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value ?? undefined}
                          onSelect={(d) => field.onChange(d ?? null)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>

              <div className='grid gap-2'>
                <Label>Assignee (optional)</Label>
                <Controller
                  name='assigneeId'
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Unassigned' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=''>Unassigned</SelectItem>
                        {assignees.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} {a.email ? `• ${a.email}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Optional extras */}
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='grid gap-2'>
                <Label htmlFor='location'>Location (optional)</Label>
                <Input
                  id='location'
                  placeholder='Kitchen, Bathroom…'
                  {...form.register('location')}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='meterReading'>Meter reading (optional)</Label>
                <Input
                  id='meterReading'
                  placeholder='e.g., 12,345'
                  {...form.register('meterReading')}
                />
              </div>
            </div>

            {/* Description */}
            <div className='grid gap-2'>
              <Label htmlFor='desc'>Description (optional)</Label>
              <Textarea
                id='desc'
                rows={5}
                placeholder='Add context, steps, access notes…'
                {...form.register('description')}
              />
            </div>

            {/* Attachments (local only for now) */}
            <div className='grid gap-2'>
              <Label>Attachments (photos/files)</Label>
              <div className='rounded-md border p-3'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='text-muted-foreground text-sm'>
                    Add images, PDFs, or docs to help technicians.
                  </div>
                  <div className='flex items-center gap-2'>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      className='hidden'
                      onChange={(e) => onPickFiles(e.currentTarget.files)}
                      accept='image/*,application/pdf,.doc,.docx,.heic,.webp'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => fileInputRef.current?.click()}
                      className='gap-2'
                    >
                      <Paperclip className='h-4 w-4' />
                      Add files
                    </Button>
                  </div>
                </div>

                {previews.length > 0 && (
                  <>
                    <Separator className='my-3' />
                    <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                      {previews.map((p) => (
                        <li
                          key={p.id}
                          className='group relative rounded-md border p-2'
                        >
                          {p.file.type.startsWith('image/') ? (
                            <img
                              src={p.url}
                              alt={p.file.name}
                              className='h-28 w-full rounded object-cover'
                            />
                          ) : (
                            <div className='bg-muted flex h-28 w-full items-center justify-center rounded text-xs'>
                              {p.file.name}
                            </div>
                          )}
                          <div className='mt-2 flex items-center justify-between gap-2'>
                            <span className='line-clamp-1 text-xs'>
                              {p.file.name}
                            </span>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => removeFile(p.id)}
                              aria-label='Remove file'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </form>
        </ScrollArea>

        {/* Footer (sticky) */}
        <div className='border-t p-4'>
          <SheetFooter className='flex w-full justify-end gap-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='mr-form'
              disabled={submitting}
              className='gap-2'
            >
              {submitting ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Plus className='h-4 w-4' />
              )}
              Create Request
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/** ——— Small helper ——— */
function FieldError({
  name,
  form,
}: {
  name: keyof RequestForm
  form: FormApi // ✅ matches useForm generics exactly
}) {
  const msg = form.formState.errors?.[name]?.message
  if (!msg) return null
  return <p className='text-[11px] text-rose-500'>{String(msg)}</p>
}
