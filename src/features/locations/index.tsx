import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import LocationsProvider from './context/locations-context'
import { columns } from './components/location-columns'
import { DataTable } from './components/data-table'
import locations from './data'
import { LocationDialogs } from './components/location-dialogs'
import { LocationPrimaryButtons } from './components/location-primary-buttons'

/**
 * Top–level component for the locations page. Composes the header,
 * primary actions, data table and associated dialogs. The
 * `LocationsProvider` wraps the component tree to supply context for
 * dialog state and the currently selected row.
 */
export default function Locations() {
  return (
    <LocationsProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Locations</h2>
            <p className='text-muted-foreground'>Manage your catchment areas.</p>
          </div>
          <LocationPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <DataTable data={locations} columns={columns} />
        </div>
      </Main>
      <LocationDialogs />
    </LocationsProvider>
  )
}