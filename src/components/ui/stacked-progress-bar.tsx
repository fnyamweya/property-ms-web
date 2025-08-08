'use client'

import * as React from 'react'

type ProgressSegment = {
  value: number
  color: string
  label?: string
}

interface StackedProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  segments: ProgressSegment[]
}

const StackedProgressBar = React.forwardRef<
  HTMLDivElement,
  StackedProgressBarProps
>(({ className, segments, ...props }, ref) => {
  const totalValue = segments.reduce((acc, segment) => acc + segment.value, 0)

  if (totalValue === 0) return null

  return (
    <div
      ref={ref}
      className={`bg-muted relative flex h-3 w-full overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {segments.map((segment, index) => {
        const percentage = (segment.value / totalValue) * 100
        return (
          <div
            key={index}
            style={{ width: `${percentage}%` }}
            className={`h-full ${segment.color} transition-all duration-300`}
            title={`${segment.label || ''}: ${segment.value}`}
          />
        )
      })}
    </div>
  )
})
StackedProgressBar.displayName = 'StackedProgressBar'

export { StackedProgressBar }
