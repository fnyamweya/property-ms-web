'use client'

import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrganizationsStore } from '@/store/organizations'
import { CreateOrganizationDialog } from '@/components/organizations/create-organization-dialog'
import { useQueryClient } from '@tanstack/react-query'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

// If you already have a Zod schema, you can import it instead of this light guard.
// import { userOrganizationsSchema } from '@/features/organizations/data/schema'

type SwitcherItem = {
  id: string
  name: string
  plan: string
  logo: React.ElementType
}

function toSwitcherItems(orgs: { id: string; name: string; plan?: string | null; logoUrl?: string | null }[]): SwitcherItem[] {
  const InitialsLogo: React.FC<{ className?: string; name: string }> = ({
    className,
    name,
  }) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase())
      .slice(0, 2)
      .join('')
    return <span className={className}>{initials || '∎'}</span>
  }

  return orgs.map((o) => ({
    id: o.id,
    name: o.name,
    plan: o.plan ?? '—',
    logo: ((props: { className?: string }) =>
      o.logoUrl ? (
        <img src={o.logoUrl!} alt={o.name} className={props.className} />
      ) : (
        <InitialsLogo className={props.className} name={o.name} />
      )) as React.ElementType,
  }))
}

export function OrganizationSwitcher({
  organizations: initialOrganizations = [],
}: {
  organizations?: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const { user, fetchMe, ensureMe, meFetched } = useAuth()
  const selectedId = useOrganizationsStore((s) => s.selectedId)
  const setSelected = useOrganizationsStore((s) => s.setSelected)
  const queryClient = useQueryClient()
  const initialItemsRef = React.useRef<SwitcherItem[]>(
    (initialOrganizations as SwitcherItem[]) ?? []
  )
  const orgsArray = (user as any)?.organizations as
    | { id: string; name: string; plan?: string | null; logoUrl?: string | null }[]
    | undefined
  const hasOrgs = Array.isArray(orgsArray)
    ? orgsArray.length > 0
    : Array.isArray((user as any)?.organizationIds)
      ? ((user as any)?.organizationIds?.length ?? 0) > 0
      : false
  const ready = meFetched || !!user
  const [createOpen, setCreateOpen] = React.useState(false)
  const [suppressAutoOpen, setSuppressAutoOpen] = React.useState(false)
  const [items, setItems] = React.useState<SwitcherItem[]>(
    // hydrate with any provided fallback organizations
    initialOrganizations as SwitcherItem[]
  )

  // Active org tracks the first available item
  const [activeOrganization, setActiveOrganization] = React.useState<
    SwitcherItem | undefined
  >(items?.[0])

  // keep activeOrganization in sync if items become available
  React.useEffect(() => {
    if (!activeOrganization && items.length > 0) {
      setActiveOrganization(items[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // Ensure we have user data (including organizations) from /me (call once)
  React.useEffect(() => {
    if (!user) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ensureMe()
    }
  }, [user, ensureMe])

  // When user.organizations updates, map to switcher items and honor currentOrganizationId from /me
  React.useEffect(() => {
    const orgs = (user as any)?.organizations as
      | { id: string; name: string; plan?: string | null; logoUrl?: string | null }[]
      | undefined
    if (orgs && Array.isArray(orgs)) {
      const mapped = toSwitcherItems(orgs)
      // only update items if different to avoid re-render loops
      const sameLength = mapped.length === items.length
      const sameIds = sameLength && mapped.every((m, i) => m.id === items[i]?.id)
      if (!sameIds) setItems(mapped)
      if (mapped.length) {
        // prefer persisted selection if present else use server hint
        const hintedId = (user as any)?.currentOrganizationId as string | undefined
        const selectedItem =
          (selectedId && mapped.find((m) => m.id === selectedId)) ||
          (hintedId && mapped.find((m) => m.id === hintedId)) ||
          undefined
        if (hintedId && !selectedId) {
          setSelected(hintedId)
        }
        const next = selectedItem ?? mapped[0]
        if (!activeOrganization || activeOrganization.id !== next.id) {
          setActiveOrganization(next)
        }
      }
    } else if (!items.length && initialItemsRef.current.length) {
      // hydrate with initial items only once when no user orgs
      setItems(initialItemsRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedId])

  // Render a stable UI even while loading/empty
  const orgsToRender = items.length ? items : initialItemsRef.current

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Persistent create-organization modal when user has none */}
        <CreateOrganizationDialog
          open={createOpen || (ready && !hasOrgs && !suppressAutoOpen)}
          onCreated={(org) => {
            // close and suppress auto-open while backend catches up
            setCreateOpen(false)
            setSuppressAutoOpen(true)
            if (org?.id) {
              setSelected(org.id)
              // Optimistically render the new org immediately
              const newItem = toSwitcherItems([
                { id: org.id, name: org.name, plan: null, logoUrl: null },
              ])[0]
              setItems((prev) => {
                const exists = prev.some((i) => i.id === org.id)
                const next = exists ? prev : [newItem, ...prev]
                return next
              })
              setActiveOrganization(newItem)
            }
          }}
          // keep it persistent only if truly no orgs and not suppressed
          persistent={ready && !hasOrgs && !suppressAutoOpen}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              disabled={!orgsToRender.length}
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                {activeOrganization ? (
                  <activeOrganization.logo className='size-4' />
                ) : (
                  <span className='size-4' />
                )}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {activeOrganization?.name ?? '—'}
                </span>
                <span className='truncate text-xs'>
                  {activeOrganization?.plan ?? '—'}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-muted-foreground text-xs'>
              Teams
            </DropdownMenuLabel>

            {orgsToRender.map((organization, index) => (
              <DropdownMenuItem
                key={`${organization.name}-${index}`}
                onClick={() => {
                  setActiveOrganization(organization)
                  setSelected(organization.id)
                  // Persist selection server-side and refresh data under new org
                  fetchMe().catch(() => {})
                  queryClient.invalidateQueries()
                }}
                className='gap-2 p-2'
              >
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  <organization.logo className='size-4 shrink-0' />
                </div>
                {organization.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className='gap-2 p-2'>
              <button
                type='button'
                onClick={() => setCreateOpen(true)}
                className='bg-background flex size-6 items-center justify-center rounded-md border'
              >
                <Plus className='size-4' />
              </button>
              <button
                type='button'
                onClick={() => setCreateOpen(true)}
                className='text-muted-foreground font-medium text-left'
              >
                Add Organization
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
