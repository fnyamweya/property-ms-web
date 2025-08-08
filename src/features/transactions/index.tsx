'use client'

import {
  IconActivity,
  IconBuildingCommunity,
  IconCurrency,
  IconUsers,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { TransactionsTable } from './components/transactions-table/index'
import { Transaction } from './components/transactions-table/types'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </CardContent>
    </Card>
  )
}

const topNav = [
  { title: 'Overview', href: '/transactions', isActive: true },
  { title: 'Properties', href: '#', isActive: false, disabled: true },
  { title: 'Tenants', href: '#', isActive: false, disabled: true },
  { title: 'Maintenance', href: '#', isActive: false, disabled: true },
]

async function getDashboardData() {
  const summaryData = [
    {
      title: 'Total Revenue',
      value: 'KES 128,451.25',
      description: '+15.4% from last month',
      icon: <IconCurrency className='text-muted-foreground h-4 w-4' />,
    },
    {
      title: 'Active Tenants',
      value: '820',
      description: '+8.2% from last month',
      icon: <IconUsers className='text-muted-foreground h-4 w-4' />,
    },
    {
      title: 'Units Occupied',
      value: '480 / 600',
      description: '80% occupancy rate',
      icon: <IconBuildingCommunity className='text-muted-foreground h-4 w-4' />,
    },
    {
      title: 'Open Requests',
      value: '24',
      description: '+5 since yesterday',
      icon: <IconActivity className='text-muted-foreground h-4 w-4' />,
    },
  ]

  const transactions: Transaction[] = [
    {
      id: 1,
      date: '2025-08-01',
      description: 'Invoice #INV-1001',
      category: 'Sales',
      status: 'Completed',
      reviewer: 'Eddie Lake',
      amount: 1200.5,
      balance: 5000,
    },
    {
      id: 2,
      date: '2025-08-02',
      description: 'Invoice #INV-1002',
      category: 'Maintenance',
      status: 'Pending',
      reviewer: 'John Doe',
      amount: 500,
      balance: 4500,
    },
    {
      id: 3,
      date: '2025-08-03',
      description: 'Invoice #INV-1003',
      category: 'Maintenance',
      status: 'Failed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 4,
      date: '2025-08-04',
      description: 'Invoice #INV-1004',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 5,
      date: '2025-08-05',
      description: 'Invoice #INV-1005',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 6,
      date: '2025-08-06',
      description: 'Invoice #INV-1006',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 7,
      date: '2025-08-07',
      description: 'Invoice #INV-1007',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 8,
      date: '2025-08-08',
      description: 'Invoice #INV-1008',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 9,
      date: '2025-08-09',
      description: 'Invoice #INV-1009',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 10,
      date: '2025-08-10',
      description: 'Invoice #INV-1010',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 11,
      date: '2025-08-11',
      description: 'Invoice #INV-1011',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 12,
      date: '2025-08-12',
      description: 'Invoice #INV-1012',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 13,
      date: '2025-08-13',
      description: 'Invoice #INV-1013',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 14,
      date: '2025-08-14',
      description: 'Invoice #INV-1014',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 15,
      date: '2025-08-15',
      description: 'Invoice #INV-1015',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
    {
      id: 16,
      date: '2025-08-16',
      description: 'Invoice #INV-1016',
      category: 'Maintenance',
      status: 'Completed',
      reviewer: 'Jane Doe',
      amount: 300,
      balance: 4200,
    },
  ]

  return { summaryData, transactions }
}

export default async function DashboardPage() {
  const { summaryData, transactions } = await getDashboardData()

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Transactions
          </h1>
          <div className='flex items-center space-x-2'>
            <Button>Export Report</Button>
          </div>
        </div>

        <Tabs defaultValue='overview'>
          <TabsList className='grid w-full grid-cols-2 sm:inline-flex sm:w-auto'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics' disabled>
              Analytics
            </TabsTrigger>
            <TabsTrigger value='reports' disabled>
              Reports
            </TabsTrigger>
            <TabsTrigger value='notifications' disabled>
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value='overview' className='mt-6 space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {summaryData.map((stat) => (
                <StatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                />
              ))}
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Overview />
            </div>
            <div>
              <TransactionsTable data={transactions} />
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
