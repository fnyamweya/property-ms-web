'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center',
        className
      )}
    >
      {icon && <div className='text-muted-foreground'>{icon}</div>}

      <h3 className='text-lg font-medium'>{title}</h3>

      {description && (
        <p className='text-muted-foreground max-w-sm text-sm'>{description}</p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} size='sm' className='mt-2'>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
