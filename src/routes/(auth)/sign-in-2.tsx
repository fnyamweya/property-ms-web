import React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

/**
 * Legacy sign-in page which has been removed from the codebase. To avoid
 * breaking the generated route tree or existing bookmarks this route
 * immediately redirects users to the current sign-in page. Once all
 * references to `/sign-in-2` have been removed this file can be deleted.
 */
export const Route = createFileRoute('/(auth)/sign-in-2')({
  component: () => {
    const navigate = useNavigate()
    React.useEffect(() => {
      navigate({ to: '/sign-in', replace: true })
    }, [navigate])
    return null
  },
})