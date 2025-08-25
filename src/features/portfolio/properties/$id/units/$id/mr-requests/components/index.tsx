'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  Wrench,
  ChevronLeft,
  Plus,
  Search,
  Filter,
  CalendarDays,
  Hash,
  Clock,
  MoreHorizontal,
  CheckCircle2,
  Undo2,
  Trash2,
  AlertTriangle,
  CircleDot,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type MRStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'
type MRPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export type MRRequest = {
  id: string
  title: string
  description?: string
  status: MRStatus
  priority: MRPriority
  unitIdentifier?: string
  createdAt?: Date
  updatedAt?: Date
  requestedBy?: string
}

type Props = {
  pid: string
  uid: string
  /** Human labels to show at the top */
  propertyName: string
  unitIdentifier?: string
  /** Requests for the WHOLE property; this component filters by unitIdentifier */
  requests: MRRequest[]

  /** Optional callbacks to mutate state (wire to your API/Store) */
  onCreateNew?: (unitIdentifier?: string) => void
  onMarkResolved?: (id: string) => void
  onReopen?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusBadgeClass: Record<MRStatus, string> = {
  Open: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
  'In Progress':
    'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400',
  Resolved:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  Closed:
    'border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400',
}

const priorityDotClass: Record<MRPriority, string> = {
  Low: 'bg-zinc-300',
  Medium: 'bg-amber-400',
  High: 'bg-orange-500',
  Urgent: 'bg-red-600',
}

const priorityOrder: Record<MRPriority, number> = {
  Urgent: 3,
  High: 2,
  Medium: 1,
  Low: 0,
}

export function UnitMRRequests({
  pid,
  uid,
  propertyName,
  unitIdentifier,
  requests,
  onCreateNew,
  onMarkResolved,
  onReopen,
  onDelete,
}: Props) {
  const navigate = useNavigate()

  // ---------- Filters / Search / Sort ----------
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState<'All' | MRStatus>('All')
  const [priority, setPriority] = React.useState<'All' | MRPriority>('All')
  const [sort, setSort] = React.useState<'newest' | 'priority' | 'status'>(
    'newest'
  )

  const data = React.useMemo(() => {
    let list = (requests || []).filter(
      (r) => !unitIdentifier || r.unitIdentifier === unitIdentifier
    )

    if (status !== 'All') list = list.filter((r) => r.status === status)
    if (priority !== 'All') list = list.filter((r) => r.priority === priority)

    if (q.trim()) {
      const s = q.toLowerCase()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          (r.description?.toLowerCase().includes(s) ?? false) ||
          (r.requestedBy?.toLowerCase().includes(s) ?? false)
      )
    }

    switch (sort) {
      case 'newest':
        list.sort(
          (a, b) =>
            (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
        )
        break
      case 'priority':
        list.sort(
          (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
        )
        break
      case 'status': {
        const order: MRStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed']
        list.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
        break
      }
    }

    return list
  }, [requests, unitIdentifier, status, priority, q, sort])

  const counts = React.useMemo(() => {
    const base = {
      All: 0,
      Open: 0,
      'In Progress': 0,
      Resolved: 0,
      Closed: 0,
    } as Record<'All', number> | Record<MRStatus, number>
    for (const r of requests) {
      if (!unitIdentifier || r.unitIdentifier === unitIdentifier) {
        ;(base as any).All++
        ;(base as any)[r.status]++
      }
    }
    return base as Record<'All' | MRStatus, number>
  }, [requests, unitIdentifier])

  const showEmpty = data.length === 0

  // ---------- UI ----------
  return (
    <div className='flex h-full min-h-0 flex-col'>
      {/* Sticky Header */}
      <div className='bg-background/70 sticky top-0 z-10 border-b p-4 backdrop-blur'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  navigate({
                    to: '/properties/$pid/units/$uid',
                    params: { pid, uid },
                    // If you have a details route, adjust accordingly
                  })
                }
                className='gap-1 px-2'
              >
                <ChevronLeft className='h-4 w-4' />
                Back
              </Button>
              <Badge variant='outline' className='rounded-full'>
                Unit #{unitIdentifier ?? uid}
              </Badge>
            </div>
            <h2 className='mt-1 truncate text-lg font-semibold'>
              {propertyName}{' '}
              <span className='text-muted-foreground'>• MR Requests</span>
            </h2>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => onCreateNew?.(unitIdentifier)}
              className='gap-2'
            >
              <Plus className='h-4 w-4' />
              New Request
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder='Search title, description, requester…'
              className='w-64 pl-8'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='text-muted-foreground h-4 w-4' />
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger className='w-[170px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='All'>All ({counts.All})</SelectItem>
                <SelectItem value='Open'>Open ({counts.Open})</SelectItem>
                <SelectItem value='In Progress'>
                  In Progress ({counts['In Progress']})
                </SelectItem>
                <SelectItem value='Resolved'>
                  Resolved ({counts.Resolved})
                </SelectItem>
                <SelectItem value='Closed'>Closed ({counts.Closed})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger className='w-[170px]'>
                <SelectValue placeholder='Priority' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='All'>All</SelectItem>
                <SelectItem value='Low'>Low</SelectItem>
                <SelectItem value='Medium'>Medium</SelectItem>
                <SelectItem value='High'>High</SelectItem>
                <SelectItem value='Urgent'>Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v: any) => setSort(v)}>
              <SelectTrigger className='w-[170px]'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest</SelectItem>
                <SelectItem value='priority'>Priority</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className='min-h-0 flex-1'>
        {showEmpty ? (
          <div className='flex h-full flex-col items-center justify-center gap-3 p-10 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full border'>
              <Wrench className='h-6 w-6' />
            </div>
            <div className='text-muted-foreground text-sm'>
              No maintenance requests yet for Unit #{unitIdentifier ?? uid}.
            </div>
            <Button onClick={() => onCreateNew?.(unitIdentifier)}>
              <Plus className='mr-2 h-4 w-4' />
              Create MR Request
            </Button>
          </div>
        ) : (
          <ScrollArea className='h-full'>
            <div className='p-4'>
              <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
                {data.map((r) => (
                  <Card
                    key={r.id}
                    className='group overflow-hidden border transition hover:shadow-md'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <CardTitle className='truncate text-base'>
                            {r.title}
                          </CardTitle>
                          <div className='text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs'>
                            <span className='inline-flex items-center gap-1'>
                              <Hash className='h-3.5 w-3.5' />
                              {r.id.slice(0, 8)}
                            </span>
                            {r.createdAt && (
                              <span className='inline-flex items-center gap-1'>
                                <CalendarDays className='h-3.5 w-3.5' />
                                {r.createdAt.toLocaleDateString('en-KE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                            <span className='inline-flex items-center gap-1'>
                              <Clock className='h-3.5 w-3.5' />
                              {r.updatedAt
                                ? `Updated ${r.updatedAt.toLocaleDateString(
                                    'en-KE',
                                    {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )}`
                                : '—'}
                            </span>
                          </div>
                        </div>

                        <div className='flex flex-col items-end gap-2'>
                          <Badge className={statusBadgeClass[r.status]}>
                            {r.status}
                          </Badge>
                          <div className='flex items-center gap-1 text-xs'>
                            <span
                              className={`h-2 w-2 rounded-full ${priorityDotClass[r.priority]}`}
                            />
                            <span className='text-muted-foreground'>
                              {r.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-3'>
                      {r.description && (
                        <p className='text-muted-foreground line-clamp-3 text-sm'>
                          {r.description}
                        </p>
                      )}

                      <div className='flex items-center justify-between'>
                        <div className='text-muted-foreground text-xs'>
                          Unit{' '}
                          <span className='font-medium'>
                            #{r.unitIdentifier ?? unitIdentifier ?? '--'}
                          </span>
                          {r.requestedBy ? (
                            <>
                              {' '}
                              &middot; Requested by{' '}
                              <span className='font-medium'>
                                {r.requestedBy}
                              </span>
                            </>
                          ) : null}
                        </div>

                        {/* Row actions */}
                        <div className='flex items-center gap-2'>
                          {r.status === 'Resolved' || r.status === 'Closed' ? (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => onReopen?.(r.id)}
                              className='gap-1'
                            >
                              <Undo2 className='h-4 w-4' />
                              Reopen
                            </Button>
                          ) : (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => onMarkResolved?.(r.id)}
                              className='gap-1'
                            >
                              <CheckCircle2 className='h-4 w-4' />
                              Mark Resolved
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
                              <DropdownMenuLabel>More</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className='gap-2 text-red-600 focus:bg-red-50'
                                onClick={() => onDelete?.(r.id)}
                              >
                                <Trash2 className='h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Priority callout for Urgent */}
                      {r.priority === 'Urgent' && (
                        <div className='mt-1 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400'>
                          <AlertTriangle className='h-4 w-4' />
                          Immediate attention required
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
