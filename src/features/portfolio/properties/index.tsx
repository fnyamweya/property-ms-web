import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PortfolioStatsCards } from './components/portfolio-stats-cards'
import { PropertyList } from './components/property-list'

export default function Properties() {
  return (
    <>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8'>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <h1 className='text-2xl font-bold tracking-tight'>Properties</h1>
            <div className='flex items-center space-x-2'>
              <Button>Export Report</Button>
            </div>
          </div>

          <PortfolioStatsCards />
          <PropertyList />
        </div>
      </Main>
    </>
  )
}
