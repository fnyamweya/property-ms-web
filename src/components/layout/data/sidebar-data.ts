import {
  IconBrowserCheck,
  IconChecklist,
  IconHelp,
  IconLayoutDashboard,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUsers,
  IconMapPin,
  IconHome,
} from '@tabler/icons-react'
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Cog,
  GitPullRequestArrow,
  Antenna,
  Building,
  Calendar,
  Signature,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Felix Ombura',
    email: 'felixombura@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Greatwall Apartments',
      logo: Command,
      plan: 'Professional Plan',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Portfolio',
          icon: Building,
          items: [
            {
              title: 'Properties',
              url: '/properties',
            },
            {
              title: 'Units',
              url: '/properties/$id/units',
            },
            {
              title: 'Tenants',
              url: '/properties/$id/tenants',
            },
            {
              title: 'Staff',
              url: '/staff',
            },
          ],
        },
        {
          title: 'Accounting',
          icon: IconChecklist,
          items: [
            {
              title: 'Transactions',
              url: '/transactions',
            },
            {
              title: 'Payments',
              url: '/payments',
            },
            {
              title: 'Balances',
              url: '/balances',
            },
          ],
        },
        {
          title: 'Lease Agreement',
          url: '/lease-agreement',
          icon: Signature,
        },
        {
          title: 'Maintenance',
          // badge: '3',
          icon: Cog,
          items: [
            {
              title: 'Requests',
              url: '/maintenance',
            },
            {
              title: 'Recurring',
              url: '/maintenance/recurring',
            },
            {
              title: 'Logs',
              url: '/maintenance/logs',
            },
          ],
        },
        {
          title: 'Calendar',
          url: '/calendar',
          icon: Calendar,
        },
        // {
        //   title: 'Apps',
        //   url: '/apps',
        //   icon: IconPackages,
        // },
        {
          title: 'Users',
          url: '/users',
          icon: IconUsers,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          title: 'Locations',
          url: '/locations',
          icon: IconMapPin,
        },
      ],
    },
  ],
}
