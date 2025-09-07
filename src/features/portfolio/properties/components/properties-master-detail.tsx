'use client'

import * as React from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useOrganizationsStore } from '@/store/organizations'
import { usePropertiesStore } from '@/store/properties'
import type { Property as ApiProperty } from '@/types/property'
import { Building2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePropertyUnits } from '@/hooks/usePropertyUnits'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Property as UIProperty, Unit as UIUnit } from '../types'
import { PropertyRail } from './property-rail'
import { UnitsPanel } from './units-panel'

const HEADER_OFFSET = 80

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

  const ownerId =
    (p as any).ownerId ??
    (Array.isArray(p.owners) && (p.owners[0] as any)?.id) ??
    ''

  return {
    id: p.id,
    name: p.name,
    propertyType,
    address,
    units: [] as any,
    imageUrl: (p as any).imageUrl ?? '',
    ownerId,
    mrRequestCounts: (p as any).mrRequestCounts ?? 0,
  }
}

export function PropertiesMasterDetail() {
  const navigate = useNavigate()
  const { location } = useRouterState()
  const searchObj = (location.search as Record<string, unknown>) ?? {}
  const fromUrl = (searchObj?.['propertyId'] as string) ?? null

  const { properties, fetchStatus, fetchError, fetchProperties } =
    usePropertiesStore(
      useShallow((s) => ({
        properties: s.properties,
        fetchStatus: s.fetchStatus,
        fetchError: s.fetchError,
        fetchProperties: s.fetchProperties,
      }))
    )

  // Current organization context
  const organizationId = useOrganizationsStore((s) => s.selectedId)

  // Fetch every time the selected organization changes
  React.useEffect(() => {
    if (!organizationId) return
    // Clear selection so the new list drives next selection
    setSelectedId(null)
    // Reset units cache marker
    setUnitsLoadedFor(null)
    fetchProperties({ page: 1, limit: 100, organizationId }).catch(() => {})
  }, [organizationId, fetchProperties])

  const items = React.useMemo<UIProperty[]>(
    () => (properties ?? []).map(toUI),
    [properties]
  )

  // ---- Units integration: lazy fetch units for selected property ----
  const { units: fetchedUnits, fetchUnits } = usePropertyUnits()
  const [unitsLoadedFor, setUnitsLoadedFor] = React.useState<string | null>(
    null
  )

  const [selectedId, setSelectedId] = React.useState<string | null>(fromUrl)
  const [isSwitching, startSwitch] = React.useTransition()

  React.useEffect(() => {
    if (items.length === 0) return
    const exists = !!selectedId && items.some((p) => p.id === selectedId)
    if (!exists) setSelectedId(items[0].id)
  }, [items, selectedId])

  React.useEffect(() => {
    if (!selectedId) return
    if (unitsLoadedFor === selectedId) return
    fetchUnits({ propertyId: selectedId, page: 1, limit: 100 })
      .then(() => setUnitsLoadedFor(selectedId))
      .catch(() => {})
  }, [selectedId, unitsLoadedFor, fetchUnits])

  // Confirm before switching property
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const pendingIdRef = React.useRef<string | null>(null)
  const select = React.useCallback((id: string) => {
    pendingIdRef.current = id
    setConfirmOpen(true)
  }, [])
  const confirmSelect = React.useCallback(() => {
    const id = pendingIdRef.current
    if (id) startSwitch(() => setSelectedId(id))
    setConfirmOpen(false)
  }, [])
  const cancelSelect = React.useCallback(() => {
    pendingIdRef.current = null
    setConfirmOpen(false)
  }, [])

  const selected = React.useMemo<UIProperty | null>(() => {
    const p = items.find((prop) => prop.id === selectedId) ?? null
    if (!p) return null
    const uiUnits: UIUnit[] =
      unitsLoadedFor === p.id
        ? fetchedUnits.map((u: any) => {
            const status = u?.tenantId
              ? 'Occupied'
              : u?.isListed
                ? 'Vacant'
                : 'Under Maintenance'
            return {
              id: u.id,
              unitIdentifier: u.unitNumber ?? u.unitIdentifier ?? u.name ?? '—',
              status,
              leaseType: (u as any).leaseType ?? 'Residential Rent',
              squareFootage: Number(
                (u as any).squareFootage ?? (u as any).squareFeet ?? 0
              ),
              currentLeaseAmount: Number((u as any).currentLeaseAmount ?? 0),
              currency: (u as any).currency ?? 'KES',
              tenantId: (u as any).tenantId ?? undefined,
              tenantName:
                (u as any).tenantName ?? (u as any).tenant?.name ?? undefined,
              leaseEndDate: (u as any).leaseEndDate
                ? new Date((u as any).leaseEndDate)
                : undefined,
            }
          })
        : []
    return { ...p, units: uiUnits }
  }, [items, selectedId, unitsLoadedFor, fetchedUnits])

  const orderedIds = React.useMemo(() => items.map((p) => p.id), [items])
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return
    e.preventDefault()
    if (!selectedId) return
    const idx = orderedIds.indexOf(selectedId)
    if (idx < 0) return
    if (e.key === 'ArrowDown' && idx < orderedIds.length - 1)
      select(orderedIds[idx + 1])
    if (e.key === 'ArrowUp' && idx > 0) select(orderedIds[idx - 1])
  }

  // Keep URL in sync with current selection for deep-linking
  React.useEffect(() => {
    if (!selectedId) return
    navigate({
      to: '.',
      replace: true,
      search: (old: Record<string, unknown>) => ({ ...old, propertyId: selectedId }),
    })
  }, [selectedId, navigate])

  if (fetchStatus === 'loading') {
    return (
      <div className='grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'>
        <div className='min-h-0 overflow-hidden p-3'>
          <Skeleton className='mb-2 h-8 w-full' />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className='mb-2 h-20 w-full' />
          ))}
        </div>
        <Card className='h-[calc(100dvh-80px)] overflow-hidden'>
          <PanelSkeleton />
        </Card>
      </div>
    )
  }

  if (fetchStatus === 'error') {
    return (
      <div className='p-6 text-sm text-red-600'>
        Failed to load properties: {String(fetchError ?? 'Unknown error')}
      </div>
    )
  }

  // Empty state when an organization has no properties
  if (fetchStatus === 'idle' && items.length === 0) {
    return (
      <div className='grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'>
        <div className='min-h-0 overflow-hidden p-3'>
          <div className='text-muted-foreground px-2 py-6 text-xs'>
            No properties for this organization.
          </div>
        </div>
        <Card className='h-[calc(100dvh-80px)] overflow-hidden'>
          <div className='flex h-full items-center justify-center p-10 text-center'>
            <div className='mx-auto max-w-sm space-y-3'>
              <div className='bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
                <Building2 className='h-6 w-6 opacity-60' />
              </div>
              <h3 className='text-lg font-semibold'>No properties yet</h3>
              <p className='text-muted-foreground text-sm'>
                Create your first property for this organization.
              </p>
              <div className='pt-1'>
                <Button asChild>
                  <a href='/properties/create'>Create property</a>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div
      className='grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]'
      onKeyDown={onKeyDown}
      role='application'
      aria-label='Properties master–detail'
      tabIndex={0}
    >
      <div className='min-h-0 overflow-hidden'>
        <PropertyRail
          items={items}
          selectedId={selectedId}
          onSelect={select}
          fillHeight
        />
      </div>

      <div
        className='lg:sticky lg:top-20'
        style={{ height: `calc(100dvh - ${HEADER_OFFSET}px)` }}
      >
        <Card className='h-full overflow-hidden'>
          {isSwitching ? (
            <PanelSkeleton />
          ) : selected ? (
            <UnitsPanel property={selected} />
          ) : (
            <EmptyState />
          )}
        </Card>
      </div>
      {/* Confirm switch */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => (o ? setConfirmOpen(true) : cancelSelect())}
        title='Open property?'
        desc='This will switch the active property context.'
        confirmText='Open'
        handleConfirm={confirmSelect}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex h-full items-center justify-center p-10 text-center'>
      <div className='mx-auto max-w-sm space-y-3'>
        <div className='bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
          <Building2 className='h-6 w-6 opacity-60' />
        </div>
        <h3 className='text-lg font-semibold'>Select a property</h3>
        <p className='text-muted-foreground text-sm'>
          Choose a property from the left rail to view its units and quick
          actions.
        </p>
        <div className='pt-1'>
          <Button variant='outline' size='sm' disabled>
            No property selected
          </Button>
        </div>
      </div>
    </div>
  )
}
function PanelSkeleton() {
  return (
    <div className='flex h-full flex-col'>
      <div className='border-b p-4'>
        <div className='bg-muted mb-2 h-6 w-1/3 animate-pulse rounded' />
        <div className='bg-muted h-4 w-1/4 animate-pulse rounded' />
      </div>
      <div className='p-4'>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className='bg-muted mb-3 h-16 w-full animate-pulse rounded'
          />
        ))}
      </div>
    </div>
  )
}
