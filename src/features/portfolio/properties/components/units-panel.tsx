'use client'

import * as React from 'react'
import {
  Wrench,
  CreditCard,
  ChevronRight,
  ChevronDown,
  User2,
  MessageSquare,
  Search,
  CalendarDays,
  Home,
} from 'lucide-react'
import { usePropertyUnits } from '@/hooks/usePropertyUnits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Property } from '../types'
import { UnitCommunicationPanel } from './panels/unit-communication'
import { UnitMRRequestsPanel } from './panels/unit-mr-request'
import { UnitPaymentsPanel } from './panels/unit-payments'

const statusBadge: Record<string, string> = {
  Occupied:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  Vacant:
    'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
  'Under Maintenance':
    'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400',
}

const PAGE_SIZE = 25
type Unit = Property['units'][number]
type PanelType = 'mr' | 'payments' | 'comm'

export function UnitsPanel({ property }: { property: Property }) {
  const { units, total, status, fetchUnits } = usePropertyUnits(property.id)

  React.useEffect(() => {
    fetchUnits({ propertyId: property.id, page: 1, limit: 100 }).catch(() => {})
  }, [property.id, fetchUnits])

  const totalCount = total || units.length
  const occ = totalCount
    ? Math.round(
        (units.filter((u) => u.status === 'Occupied').length / totalCount) * 100
      )
    : 0

  const income = units.reduce(
    (s, u) => s + Number(u.currentLeaseAmount ?? 0),
    0
  )

  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  const filteredUnits = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return units.filter((u) => {
      const matchesSearch =
        q === '' ||
        u.unitIdentifier.toLowerCase().includes(q) ||
        (u.tenantName ?? '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [units, search, statusFilter])

  // ---------------- Lazy load ----------------
  const [visible, setVisible] = React.useState(PAGE_SIZE)
  const scrollerRef = React.useRef<HTMLDivElement | null>(null)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(
    () => setVisible(PAGE_SIZE),
    [property.id, filteredUnits.length]
  )

  React.useEffect(() => {
    if (!sentinelRef.current || !scrollerRef.current) return
    const root = scrollerRef.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filteredUnits.length))
        }
      },
      { root, threshold: 0.1 }
    )
    io.observe(sentinelRef.current)
    return () => io.disconnect()
  }, [filteredUnits.length])

  const rows = filteredUnits.slice(0, visible)

  const [openId, setOpenId] = React.useState<string | null>(null)
  const toggle = (id: string) => setOpenId((curr) => (curr === id ? null : id))

  const [panel, setPanel] = React.useState<{
    type: PanelType | null
    unit: Unit | null
  }>({ type: null, unit: null })

  const openPanel = (type: PanelType, unit: Unit) => setPanel({ type, unit })
  const closePanel = () => setPanel({ type: null, unit: null })

  type MR = {
    id: string
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
    unitIdentifier?: string
  }
  const mrRequests: MR[] = (property as any).mrRequests ?? []
  const getMRCount = (unitIdentifier?: string) =>
    mrRequests.filter(
      (r) =>
        r.unitIdentifier === unitIdentifier &&
        (r.status === 'Open' || r.status === 'In Progress')
    ).length

  return (
    <div className='flex h-full min-h-0 flex-col'>
      {/* Sticky header */}
      <div className='bg-background/70 sticky top-0 z-10 border-b p-4 backdrop-blur'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h2 className='flex items-center text-lg font-semibold'>
              {property.name}
              <ChevronRight className='mx-2 h-4 w-4 opacity-50' />
              <span className='text-muted-foreground text-base'>Units</span>
            </h2>
            <p className='text-muted-foreground text-xs'>
              {property.address} • {status === 'loading' ? '…' : totalCount}{' '}
              units • {occ}% occupancy • KES {income.toLocaleString('en-KE')} /
              mo
            </p>
          </div>
          <Badge variant='outline'>{property.propertyType}</Badge>
        </div>

        {/* Filter Bar */}
        <div className='mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4'>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Search units or tenant...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-8'
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Filter by status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              <SelectItem value='Occupied'>Occupied</SelectItem>
              <SelectItem value='Vacant'>Vacant</SelectItem>
              <SelectItem value='Under Maintenance'>
                Under Maintenance
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable table */}
      <div ref={scrollerRef} className='min-h-0 flex-1 overflow-auto'>
        <Table className='w-full'>
          <TableHeader className='bg-background/95 sticky top-0 z-10 backdrop-blur'>
            <TableRow>
              <TableHead className='w-10' />
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Rent (KES)</TableHead>
              <TableHead className='text-right'>Lease End</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((u) => {
              const isOpen = openId === u.id
              const mrCount = getMRCount(u.unitIdentifier)
              const leaseEnd = u.leaseEndDate

              return (
                <React.Fragment key={u.id}>
                  <TableRow
                    className={`${isOpen ? 'bg-accent/50' : ''} hover:bg-accent/40 cursor-pointer`}
                    onClick={() => toggle(u.id)}
                  >
                    <TableCell>
                      {isOpen ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </TableCell>

                    <TableCell>
                      <div className='font-medium'>#{u.unitIdentifier}</div>
                      <div className='text-muted-foreground mt-0.5 text-[11px]'>
                        {u.leaseType} •{' '}
                        {u.squareFootage ? `${u.squareFootage} sq ft` : '—'}
                      </div>

                      {u.tenantName && (
                        <div className='mt-1'>
                          <Badge
                            variant='secondary'
                            className='rounded-full text-[10px]'
                          >
                            {u.tenantName}
                          </Badge>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge className={statusBadge[u.status] ?? ''}>
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell className='text-right'>
                      {u.currentLeaseAmount.toLocaleString('en-KE')}
                    </TableCell>

                    <TableCell className='text-right'>
                      {leaseEnd
                        ? leaseEnd.toLocaleDateString('en-KE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                  </TableRow>

                  {/* Expanded panel */}
                  {isOpen && (
                    <TableRow className='bg-muted/20'>
                      <TableCell colSpan={5} className='p-0'>
                        <div className='space-y-4 p-4'>
                          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                            <div className='flex min-w-0 items-start gap-3'>
                              <div className='bg-muted flex h-9 w-9 items-center justify-center rounded-full'>
                                <User2 className='h-4 w-4' />
                              </div>
                              <div className='min-w-0'>
                                <div className='truncate text-sm font-medium'>
                                  {u.tenantName ?? 'No tenant'}
                                </div>

                                <div className='text-muted-foreground mt-1 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2'>
                                  {leaseEnd && (
                                    <span className='flex items-center gap-1'>
                                      <CalendarDays className='h-3.5 w-3.5' />
                                      <span>
                                        Lease End:{' '}
                                        {leaseEnd.toLocaleDateString('en-KE', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                        })}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className='flex flex-wrap justify-end gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openPanel('mr', u)
                                }}
                              >
                                <Wrench className='mr-2 h-4 w-4' />
                                MR Requests
                                <Badge
                                  variant='secondary'
                                  className='ml-2 h-5 rounded-full px-2 text-xs'
                                >
                                  {mrCount}
                                </Badge>
                              </Button>

                              <Button
                                variant='outline'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openPanel('payments', u)
                                }}
                              >
                                <CreditCard className='mr-2 h-4 w-4' />
                                Payments
                              </Button>

                              <Button
                                variant='outline'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openPanel('comm', u)
                                }}
                              >
                                <MessageSquare className='mr-2 h-4 w-4' />
                                Communication
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          {/* Unit details (typed-only fields) */}
                          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                            <Detail
                              label='Unit'
                              value={`#${u.unitIdentifier}`}
                              icon={<Home className='h-3.5 w-3.5' />}
                            />
                            <Detail label='Status' value={u.status} />
                            <Detail label='Lease Type' value={u.leaseType} />
                            <Detail
                              label='Area'
                              value={
                                u.squareFootage
                                  ? `${u.squareFootage} sq ft`
                                  : '—'
                              }
                            />
                            <Detail
                              label='Rent'
                              value={`KES ${u.currentLeaseAmount.toLocaleString('en-KE')}`}
                            />
                            <Detail
                              label='Lease End'
                              value={
                                leaseEnd
                                  ? leaseEnd.toLocaleDateString('en-KE', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '—'
                              }
                            />
                            <Detail label='Property' value={property.name} />
                            <Detail label='Address' value={property.address} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-muted-foreground text-center text-sm'
                >
                  {status === 'loading' ? 'Loading…' : 'No units found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Lazy-load sentinel */}
        <div ref={sentinelRef} className='h-10 w-full' />
        {visible < filteredUnits.length && (
          <div className='text-muted-foreground py-3 text-center text-xs'>
            Loading more units…
          </div>
        )}
      </div>

      {/* SHEET HOST */}
      <Sheet open={!!panel.type} onOpenChange={(o) => !o && closePanel()}>
        <SheetContent
          side='right'
          className='w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl'
        >
          <SheetHeader>
            <SheetTitle>
              {panel.type === 'mr' && 'Maintenance Requests'}
              {panel.type === 'payments' && 'Payments'}
              {panel.type === 'comm' && 'Communication'}
            </SheetTitle>
          </SheetHeader>

          <div className='mt-4'>
            {panel.type === 'mr' && panel.unit && (
              <UnitMRRequestsPanel
                pid={property.id}
                uid={panel.unit.id}
                unit={panel.unit}
                onClose={closePanel}
              />
            )}
            {panel.type === 'payments' && panel.unit && (
              <UnitPaymentsPanel
                pid={property.id}
                uid={panel.unit.id}
                unit={panel.unit}
                onClose={closePanel}
              />
            )}
            {panel.type === 'comm' && panel.unit && (
              <UnitCommunicationPanel
                pid={property.id}
                uid={panel.unit.id}
                unit={panel.unit}
                onClose={closePanel}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* Helper */
function Detail({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-muted-foreground mb-0.5 flex items-center gap-1.5 text-[11px] tracking-wide uppercase'>
        {icon ?? null}
        {label}
      </div>
      <div className='text-sm leading-5 font-medium'>{value}</div>
    </div>
  )
}
