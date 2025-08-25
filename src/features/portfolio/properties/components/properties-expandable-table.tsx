'use client'

import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePropertiesStore } from '@/store/properties'
import type { Property as ApiProperty } from '@/types/property'
import type { PropertyUnit } from '@/types/property-unit'
import {
  ChevronDown,
  ChevronRight,
  Users,
  Wrench,
  FileText,
} from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { usePropertyUnits } from '@/hooks/usePropertyUnits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Property as UIProperty } from '../types'

const statusBadge: Record<string, string> = {
  Occupied:
    'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400',
  Vacant:
    'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400',
  'Under Maintenance':
    'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400',
}

function toUI(p: ApiProperty): UIProperty {
  const address =
    ((p as any).address ??
      (p as any).fullAddress ??
      [
        (p as any).addressLine1 ?? p?.config?.addressLine1,
        (p as any).city ?? p?.config?.city,
        (p as any).country ?? p?.config?.country,
      ]
        .filter(Boolean)
        .join(', ')) ||
    '—'
  const propertyType = (p as any).type ?? (p as any).propertyType ?? 'Unknown'
  return {
    id: p.id,
    name: p.name,
    propertyType,
    address,
    units: [] as any,
    imageUrl: (p as any).imageUrl ?? '',
    ownerId: (p as any).ownerId ?? '',
    mrRequestCounts: (p as any).mrRequestCounts ?? 0,
  }
}

function mapUnitToUI(u: PropertyUnit, propertyName: string) {
  const status = u.tenantId
    ? 'Occupied'
    : u.isListed
      ? 'Vacant'
      : 'Under Maintenance'
  return {
    id: u.id,
    unitIdentifier: u.unitNumber ?? u.name ?? '—',
    status,
    tenantName: (u as any)?.tenant?.name ?? undefined,
    currentLeaseAmount: Number((u as any)?.currentLeaseAmount ?? 0),
    leaseEndDate: (u as any)?.leaseEndDate
      ? new Date((u as any).leaseEndDate)
      : undefined,
    name: u.name ?? u.unitNumber ?? '—',
    propertyName,
  }
}

export function PropertiesExpandableTable() {
  const { properties, fetchStatus, fetchError, fetchProperties } =
    usePropertiesStore(
      useShallow((s) => ({
        properties: s.properties,
        fetchStatus: s.fetchStatus,
        fetchError: s.fetchError,
        fetchProperties: s.fetchProperties,
      }))
    )

  React.useEffect(() => {
    if (!properties?.length && fetchStatus === 'idle') {
      fetchProperties({ page: 1, limit: 100 })
    }
  }, [properties?.length, fetchStatus, fetchProperties])

  const items = React.useMemo<UIProperty[]>(
    () => (properties ?? []).map(toUI),
    [properties]
  )

  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Card className='overflow-hidden'>
      <div className='border-b p-4'>
        <h2 className='text-lg font-semibold'>Portfolio Units</h2>
        <p className='text-muted-foreground text-sm'>
          Expand a property to view its units and take actions.
        </p>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'></TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className='text-right'>Units</TableHead>
              <TableHead className='text-right'>Occupancy</TableHead>
              <TableHead className='text-right'>Monthly Rent</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((p) => (
              <React.Fragment key={p.id}>
                <PropertySummaryRow
                  property={p}
                  isOpen={expanded.has(p.id)}
                  onToggle={() => toggle(p.id)}
                />
                {expanded.has(p.id) && <ExpandableUnitsRow property={p} />}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

function PropertySummaryRow({
  property,
  isOpen,
  onToggle,
}: {
  property: UIProperty
  isOpen: boolean
  onToggle: () => void
}) {
  const { units, total, status, fetchUnits } = usePropertyUnits()
  const [loadedFor, setLoadedFor] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isOpen) return
    if (loadedFor === property.id) return
    fetchUnits({ propertyId: property.id, page: 1, limit: 100 })
      .then(() => setLoadedFor(property.id))
      .catch(() => {})
  }, [isOpen, property.id, loadedFor, fetchUnits])

  const unitsForProperty = React.useMemo(
    () => (loadedFor === property.id ? units : []),
    [units, loadedFor, property.id]
  )

  const totalUnits = total || unitsForProperty.length
  const occupied = unitsForProperty.filter((u) => u.tenantId).length
  const occPct = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0
  const income = unitsForProperty.reduce(
    (sum, u) => sum + Number((u as any)?.currentLeaseAmount ?? 0),
    0
  )

  return (
    <TableRow className='hover:bg-muted/40'>
      <TableCell className='align-top'>
        <button
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          onClick={onToggle}
          className='hover:bg-muted inline-flex items-center rounded p-1'
        >
          {isOpen ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </button>
      </TableCell>
      <TableCell className='align-top'>
        <div className='font-medium'>{property.name}</div>
        <div className='text-muted-foreground text-xs'>
          #{property.id.slice(0, 8)}
        </div>
      </TableCell>
      <TableCell className='align-top'>
        <Badge variant='outline'>{property.propertyType}</Badge>
      </TableCell>
      <TableCell className='align-top'>{property.address}</TableCell>
      <TableCell className='text-right align-top'>
        {status === 'loading' ? '…' : totalUnits}
      </TableCell>
      <TableCell className='text-right align-top'>
        {status === 'loading' ? '…' : `${occPct}%`}
      </TableCell>
      <TableCell className='text-right align-top'>
        KES {income.toLocaleString('en-KE')}
      </TableCell>
    </TableRow>
  )
}

function ExpandableUnitsRow({ property }: { property: UIProperty }) {
  const navigate = useNavigate()
  const { units } = usePropertyUnits()

  const rows = React.useMemo(
    () => units.map((u) => mapUnitToUI(u, property.name)),
    [units, property.name]
  )

  return (
    <TableRow className='bg-muted/10'>
      <TableCell colSpan={7} className='p-0'>
        <div className='grid gap-4 p-4'>
          <div className='overflow-x-auto rounded border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead className='text-right'>Rent (KES)</TableHead>
                  <TableHead className='text-right'>Lease End</TableHead>
                  <TableHead className='w-[320px] text-right'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className='font-medium'>#{u.unitIdentifier}</div>
                      <div className='text-muted-foreground text-xs'>
                        {property.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusBadge[u.status] ?? ''}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.tenantName ?? (
                        <span className='text-muted-foreground text-sm'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {u.currentLeaseAmount.toLocaleString('en-KE')}
                    </TableCell>
                    <TableCell className='text-right'>
                      {u.leaseEndDate
                        ? u.leaseEndDate.toLocaleDateString('en-KE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex flex-wrap justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            navigate({
                              to: '/properties/$pid/units/$uid/tenants',
                              params: { pid: property.id, uid: u.id },
                            })
                          }
                        >
                          <Users className='mr-2 h-4 w-4' />
                          Tenants
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            navigate({
                              to: '/properties/$pid/units/$uid/maintenance',
                              params: { pid: property.id, uid: u.id },
                            })
                          }
                        >
                          <Wrench className='mr-2 h-4 w-4' />
                          MR Requests
                        </Button>
                        <Button
                          size='sm'
                          onClick={() =>
                            navigate({
                              to: '/properties/$pid/units/$uid/accounting',
                              params: { pid: property.id, uid: u.id },
                            })
                          }
                        >
                          <FileText className='mr-2 h-4 w-4' />
                          Accounting
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center text-sm'
                    >
                      No units found for this property.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end'>
            <Button
              variant='secondary'
              onClick={() =>
                navigate({
                  to: '/properties/$id/overview',
                  params: { id: property.id },
                })
              }
            >
              Open Property Dashboard
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
