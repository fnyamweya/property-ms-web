import { useNavigate } from '@tanstack/react-router'
import { IconCirclePlusFilled, IconMail } from '@tabler/icons-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/sign-in' })
  }

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenuItem className='flex flex-col gap-2 px-4'>
          <SidebarMenuButton
            tooltip='Quick Create'
            className='bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear'
          >
            <IconCirclePlusFilled />
            <span>Quick Create</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {sidebarData.navGroups.map((ng) => (
          <NavGroup key={ng.title} {...ng} />
        ))}
      </SidebarContent>
      <SidebarFooter className='flex flex-col gap-2 px-4'>
        {/* user info */}
        <NavUser user={user ?? sidebarData.user} />
        {/* logout button */}
        {user && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleLogout}
            className='w-full'
          >
            Logout
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
