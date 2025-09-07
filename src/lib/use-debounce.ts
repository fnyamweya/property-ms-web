"use client"

import * as React from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
  const [state, setState] = React.useState<T>(value)
  React.useEffect(() => {
    const t = setTimeout(() => setState(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return state
}
