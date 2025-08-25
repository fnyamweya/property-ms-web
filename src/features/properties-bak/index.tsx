import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import PropertiesProvider from './context/properties-context'
import { PropertyPrimaryButtons } from './components/property-primary-buttons'
import { PropertyDialogs } from './components/property-dialogs'
import { DataTable } from './components/data-table'
import { columns } from './components/property-columns'
import properties from './data'

/**
 * Top–level component for the property management page. Composes
 * a fixed header, action buttons, data table and associated dialogs.
 * The `PropertiesProvider` supplies context for dialog state and the
 * currently selected row. Replace the imported `properties` array
 * with data fetched from your API when integrating into a real app.
 */
export default function Properties() {
  return (
    <PropertiesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Properties</h2>
            <p className='text-muted-foreground'>Manage your property portfolio.</p>
          </div>
          <PropertyPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <DataTable data={properties} columns={columns} />
        </div>
      </Main>
      <PropertyDialogs />
    </PropertiesProvider>
  )
}