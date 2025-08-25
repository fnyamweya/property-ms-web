'use client'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PropertiesMasterDetail } from './components/properties-master-detail'

export default function Properties() {
  return (
    <>
      <Header>
        <GlobalSearch />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex h-full min-h-0 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8'>
          <div className='mb-2 flex items-center justify-between'>
            <h1 className='text-2xl font-bold tracking-tight'>Properties</h1>
          </div>
          <PropertiesMasterDetail />
        </div>
      </Main>
    </>
  )
}
