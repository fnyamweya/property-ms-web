'use client'

import { useEffect } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'

export default function Users() {
  const { users, status, error, limit, fetchUsers } =
    useUsers()

  useEffect(() => {
    fetchUsers({ page: 1, limit })
  }, [])

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {status === 'loading' ? (
            <Skeleton className='h-[320px] w-full' />
          ) : status === 'error' ? (
            <div className='text-red-600'>Error: {error}</div>
          ) : (
            <UsersTable data={users} columns={columns} />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
