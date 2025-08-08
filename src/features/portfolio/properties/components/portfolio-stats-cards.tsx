import { Home, Users, DollarSign, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PortfolioStatsCards() {
  const stats = {
    totalProperties: 12,
    occupancyRate: 83.3,
    totalMonthlyRent: 34500,
    openMaintenanceRequests: 4,
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Properties
          </CardTitle>
          <Home className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalProperties}</div>
          <p className='text-muted-foreground text-xs'>+2 since last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Occupancy Rate</CardTitle>
          <Users className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.occupancyRate}%</div>
          <p className='text-muted-foreground text-xs'>
            9 of 12 units occupied
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Monthly Rent
          </CardTitle>
          <DollarSign className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            ${stats.totalMonthlyRent.toLocaleString()}
          </div>
          <p className='text-muted-foreground text-xs'>Projected revenue</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Maintenance</CardTitle>
          <Wrench className='text-muted-foreground h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>
            +{stats.openMaintenanceRequests}
          </div>
          <p className='text-muted-foreground text-xs'>Open requests</p>
        </CardContent>
      </Card>
    </div>
  )
}
