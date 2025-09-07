'use client'

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as GlobalSearch } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import * as React from 'react'
import { PropertiesMasterDetail } from './components/properties-master-detail'
import { PropertyCreateDrawer } from './components/property-create-drawer'

export default function Properties() {
  const [createOpen, setCreateOpen] = React.useState(false)
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
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Properties
          </h1>
          <div className='flex items-center space-x-2'>
            <Button onClick={() => setCreateOpen(true)}>Create property</Button>
          </div>
        </div>
        <div className='flex h-full min-h-0 flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8'>
          <PropertiesMasterDetail />
        </div>
        <PropertyCreateDrawer open={createOpen} onOpenChange={setCreateOpen} />
      </Main>
    </>
  )
}
