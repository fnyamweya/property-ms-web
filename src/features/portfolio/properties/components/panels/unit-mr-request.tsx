'use client'

import * as React from 'react'
import {
  Wrench,
  Plus,
  Filter,
  X,
  MoreHorizontal,
  CheckCircle2,
  PlayCircle,
  CircleSlash2,
  ArrowUpDown,
  ListChecks,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreateMRRequestDialog,
  type CreateMRRequestInput,
} from './create-mr-request'

type Props = {
  pid: string
  uid: string
  unit: any
  onClose?: () => void
}

type Assignee = { id: string; name: string; email?: string }

const STATUS_COLORS: Record<string, string> = {
  Open: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950 dark:text-amber-300',
  'In Progress':
    'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950 dark:text-sky-300',
  Resolved:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-300',
  Closed:
    'border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-emerald-500',
  Normal: 'bg-sky-500',
  High: 'bg-amber-500',
  Urgent: 'bg-rose-500',
}

type Status = 'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'
type Priority = 'Low' | 'Normal' | 'High' | 'Urgent'

export type MR = {
  id: string
  title?: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  category?: string
  priority?: Priority
  createdAt?: string | Date
  dueAt?: string | Date
  assignee?: { name: string; initials?: string }
  description?: string
}

function timeAgo(date: string | Date | undefined) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function dueLabel(dueAt?: string | Date) {
  if (!dueAt) return null
  const d = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  const diff = d.getTime() - Date.now()
  const hours = Math.round(diff / 36e5)
  const overdue = diff < 0
  return overdue
    ? { text: 'Overdue', tone: 'destructive' as const }
    : { text: `Due in ${hours}h`, tone: 'secondary' as const }
}

export function UnitMRRequestsPanel({ pid, uid, unit, onClose }: Props) {
  const [requests, setRequests] = React.useState<MR[]>(
    () => (unit?.mrRequests ?? []) as MR[]
  )
  React.useEffect(() => {
    setRequests((unit?.mrRequests ?? []) as MR[])
  }, [uid, unit?.mrRequests])

  /** Create side panel */
  const [openCreate, setOpenCreate] = React.useState(false)
  const create = () => setOpenCreate(true)

  async function handleCreate(input: CreateMRRequestInput) {
    const roster: Assignee[] = (unit?.assignees ?? []) as Assignee[]
    const assigneeName = input.assigneeId
      ? (roster.find((a) => a.id === input.assigneeId)?.name ?? 'Assignee')
      : undefined

    const optimistic: MR = {
      id: `temp-${crypto.randomUUID()}`,
      title: input.title,
      status: 'Open',
      category: input.category,
      priority: input.priority,
      createdAt: new Date().toISOString(),
      dueAt: (input as any).dueAt ?? undefined,
      description: input.description ?? '',
      assignee: assigneeName ? { name: assigneeName } : undefined,
    }

    setRequests((prev) => [optimistic, ...prev])

    try {
      await sendCreateMR(pid, uid, input) // replace with real API
      toast.success('Maintenance request created', {
        description: `“${input.title}” has been logged.`,
      })
    } catch (e: any) {
      setRequests((prev) => prev.filter((r) => r.id !== optimistic.id))
      toast.error('Failed to create request', {
        description: e?.message ?? 'Please try again.',
      })
      throw e
    }
  }

  const [query, setQuery] = React.useState('')
  const [tab, setTab] = React.useState<Status>('All')
  const [priorities, setPriorities] = React.useState<Record<Priority, boolean>>(
    {
      Low: false,
      Normal: false,
      High: false,
      Urgent: false,
    }
  )
  const [sort, setSort] = React.useState<
    'recent' | 'oldest' | 'priority' | 'sla'
  >('recent')
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const searchRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const activePrioritySet = new Set(
    (Object.keys(priorities) as Priority[]).filter((p) => priorities[p])
  )

  const countsByStatus = requests.reduce<Record<Status, number>>(
    (acc, r) => {
      const s = (r.status as Status) ?? 'Open'
      acc[s] = (acc[s] ?? 0) + 1
      acc['All'] = (acc['All'] ?? 0) + 1
      return acc
    },
    { All: 0, Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 }
  )

  const filtered = requests
    .filter((r) => (tab === 'All' ? true : r.status === tab))
    .filter((r) =>
      activePrioritySet.size === 0
        ? true
        : r.priority
          ? activePrioritySet.has(r.priority)
          : false
    )
    .filter((r) => {
      if (!query.trim()) return true
      const hay =
        `${r.title ?? ''} ${r.category ?? ''} ${r.priority ?? ''} ${r.status ?? ''} ${r.description ?? ''}`.toLowerCase()
      return hay.includes(query.trim().toLowerCase())
    })
    .sort((a, b) => {
      if (sort === 'recent')
        return (
          (new Date(b.createdAt ?? 0).getTime() || 0) -
          (new Date(a.createdAt ?? 0).getTime() || 0)
        )
      if (sort === 'oldest')
        return (
          (new Date(a.createdAt ?? 0).getTime() || 0) -
          (new Date(b.createdAt ?? 0).getTime() || 0)
        )
      if (sort === 'priority') {
        const order: Priority[] = ['Urgent', 'High', 'Normal', 'Low']
        const ai = order.indexOf(a.priority ?? 'Normal')
        const bi = order.indexOf(b.priority ?? 'Normal')
        return ai - bi
      }
      const ad = a.dueAt ? new Date(a.dueAt).getTime() : Infinity
      const bd = b.dueAt ? new Date(b.dueAt).getTime() : Infinity
      return ad - bd
    })

  const setStatus = (id: string, status: MR['status']) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    toast('Status updated', { description: `Request ${id} → ${status}` })
  }
  const start = (id: string) => setStatus(id, 'In Progress')
  const resolve = (id: string) => setStatus(id, 'Resolved')
  const closeReq = (id: string) => setStatus(id, 'Closed')

  const clearAllFilters = () => {
    setPriorities({ Low: false, Normal: false, High: false, Urgent: false })
    setTab('All')
    setQuery('')
    setSort('recent')
  }

  return (
    <div className='flex min-h-[70vh] flex-col px-4'>
      {/* Header */}
      <div className='from-background via-background sticky top-0 z-10 bg-gradient-to-b to-transparent pt-1 pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
              <Wrench className='h-4 w-4' />
            </div>
            <div className='leading-tight'>
              <div className='text-sm font-semibold'>Maintenance Requests</div>
              <div className='text-muted-foreground text-xs'>
                Unit #{unit?.unitIdentifier}
              </div>
            </div>
            <Badge variant='outline' className='ml-2'>
              {countsByStatus.All} total
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            <Button size='sm' className='gap-2' onClick={create}>
              <Plus className='h-4 w-4' />
              New Request
            </Button>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='mr-1 h-4 w-4' />
              Close
            </Button>
          </div>
        </div>

        {/* Primary controls */}
        <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search title, category, notes… (⌘/Ctrl + K)'
              className='pl-8'
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Filter className='h-4 w-4' />
                Filters
                {(activePrioritySet.size > 0 ||
                  tab !== 'All' ||
                  sort !== 'recent') && (
                  <Badge variant='secondary' className='ml-1'>
                    {activePrioritySet.size +
                      (tab !== 'All' ? 1 : 0) +
                      (sort !== 'recent' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {(['Urgent', 'High', 'Normal', 'Low'] as Priority[]).map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorities[p]}
                  onCheckedChange={(v) =>
                    setPriorities((prev) => ({ ...prev, [p]: Boolean(v) }))
                  }
                >
                  <span
                    className={cn(
                      'mr-2 inline-block h-2 w-2 rounded-full',
                      PRIORITY_COLORS[p]
                    )}
                  />
                  {p}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSort('recent')} inset>
                <ArrowUpDown className='mr-2 h-4 w-4' /> Most recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('oldest')} inset>
                <ArrowUpDown className='mr-2 h-4 w-4 rotate-180' /> Oldest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('priority')} inset>
                <ListChecks className='mr-2 h-4 w-4' /> Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('sla')} inset>
                <ListChecks className='mr-2 h-4 w-4' /> SLA / Due date
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clearAllFilters}
                className='text-muted-foreground'
                inset
              >
                Reset filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Tabs */}
        <div className='mt-3'>
          <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
            <TabsList className='grid w-full grid-cols-5'>
              {(
                ['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as Status[]
              ).map((s) => (
                <TabsTrigger
                  key={s}
                  value={s}
                  className='flex items-center gap-2'
                >
                  <span>{s}</span>
                  <Badge variant='secondary'>{countsByStatus[s]}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Separator className='mb-3' />

      {/* Content */}
      <ScrollArea className='-mr-2 pr-2'>
        <div className='grid gap-2 pb-12'>
          {filtered.length === 0 ? (
            <EmptyState onCreate={create} />
          ) : (
            filtered.map((r) => {
              const due = dueLabel(r.dueAt)
              const isExpanded = expandedId === r.id

              return (
                <div
                  key={r.id}
                  className={cn(
                    'group bg-card rounded-md border p-3 transition-colors',
                    isExpanded ? 'ring-ring ring-1' : 'hover:bg-accent/40'
                  )}
                >
                  {/* Row 1 */}
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <div className='truncate text-sm font-semibold'>
                          {r.title ?? `Request ${r.id}`}
                        </div>
                        {r.status && (
                          <Badge
                            className={cn(
                              'border',
                              STATUS_COLORS[r.status] ?? ''
                            )}
                          >
                            {r.status}
                          </Badge>
                        )}
                        {r.priority && (
                          <span className='inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]'>
                            <span
                              className={cn(
                                'inline-block h-2 w-2 rounded-full',
                                PRIORITY_COLORS[r.priority]
                              )}
                            />
                            {r.priority}
                          </span>
                        )}
                        {due && (
                          <Badge
                            variant={
                              due.tone === 'destructive'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {due.text}
                          </Badge>
                        )}
                      </div>
                      <div className='text-muted-foreground mt-1 line-clamp-1 text-xs'>
                        {r.category ?? 'General'} • Created{' '}
                        {timeAgo(r.createdAt)}
                        {r.assignee?.name
                          ? ` • Assigned to ${r.assignee.name}`
                          : ''}
                      </div>
                    </div>

                    <div className='flex shrink-0 items-center gap-1 opacity-90'>
                      {r.status === 'Open' && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='gap-1'
                          onClick={() => start(r.id)}
                        >
                          <PlayCircle className='h-4 w-4' />
                          Start
                        </Button>
                      )}
                      {(r.status === 'Open' || r.status === 'In Progress') && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='gap-1'
                          onClick={() => resolve(r.id)}
                        >
                          <CheckCircle2 className='h-4 w-4' />
                          Resolve
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size='icon'
                            variant='ghost'
                            className='h-8 w-8'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem onClick={() => closeReq(r.id)}>
                            <CircleSlash2 className='mr-2 h-4 w-4' />
                            Close request
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setExpandedId(isExpanded ? null : r.id)
                            }
                          >
                            {isExpanded ? 'Hide details' : 'Quick view'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Row 2 */}
                  {r.description && !isExpanded && (
                    <div className='text-muted-foreground mt-2 line-clamp-2 text-xs'>
                      {r.description}
                    </div>
                  )}

                  {/* Collapsible */}
                  <Collapsible
                    open={isExpanded}
                    onOpenChange={(o) => setExpandedId(o ? r.id : null)}
                  >
                    <CollapsibleContent className='mt-3 space-y-3'>
                      {r.description && (
                        <div className='bg-muted/30 rounded-md p-3 text-xs leading-relaxed'>
                          {r.description}
                        </div>
                      )}
                      <div className='grid gap-2 text-xs sm:grid-cols-2'>
                        <Field label='Category' value={r.category ?? '—'} />
                        <Field label='Priority' value={r.priority ?? '—'} />
                        <Field label='Created' value={timeAgo(r.createdAt)} />
                        <Field
                          label='Due'
                          value={
                            r.dueAt
                              ? new Date(r.dueAt as any).toLocaleDateString(
                                  'en-KE',
                                  {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )
                              : '—'
                          }
                        />
                        <Field
                          label='Assignee'
                          value={r.assignee?.name ?? 'Unassigned'}
                        />
                        <Field label='ID' value={r.id} />
                      </div>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => resolve(r.id)}
                        >
                          <CheckCircle2 className='mr-2 h-4 w-4' />
                          Mark Resolved
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => setExpandedId(null)}
                        >
                          Hide
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* CREATE SIDE PANEL */}
      <CreateMRRequestDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        pid={pid}
        uid={uid}
        unitIdentifier={unit?.unitIdentifier}
        assignees={unit?.assignees ?? []}
        categories={[
          'General',
          'Plumbing',
          'Electrical',
          'HVAC',
          'Structural',
          'Landscaping',
          'Security',
        ]}
        onCreate={handleCreate}
      />
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='rounded-md border p-2'>
      <div className='text-muted-foreground mb-1 text-[10px] tracking-wide uppercase'>
        {label}
      </div>
      <div className='text-xs font-medium'>{value}</div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className='text-center'>
      <div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border'>
        <Wrench className='h-4 w-4' />
      </div>
      <div className='text-sm font-medium'>No maintenance requests yet</div>
      <div className='text-muted-foreground mx-auto mt-1 max-w-sm text-xs'>
        Track issues, assign work, and watch progress in one place. Create your
        first request to get started.
      </div>
      <div className='mt-3'>
        <Button size='sm' onClick={onCreate} className='gap-2'>
          <Plus className='h-4 w-4' />
          Create request
        </Button>
      </div>
    </div>
  )
}

/** Example API stub */
async function sendCreateMR(
  pid: string,
  uid: string,
  input: CreateMRRequestInput
) {
  await new Promise((r) => setTimeout(r, 500))
}
