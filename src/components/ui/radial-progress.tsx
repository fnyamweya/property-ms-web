'use client'

import * as React from 'react'

interface RadialProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
}

const RadialProgress = React.forwardRef<HTMLDivElement, RadialProgressProps>(
  ({ className, value, size = 80, strokeWidth = 8, ...props }, ref) => {
    const center = size / 2
    const radius = center - strokeWidth / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
      <div
        ref={ref}
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg width={size} height={size} className='-rotate-90 transform'>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke='currentColor'
            strokeWidth={strokeWidth}
            fill='transparent'
            className='text-muted/20'
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke='currentColor'
            strokeWidth={strokeWidth}
            fill='transparent'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'
            className='text-primary transition-[stroke-dashoffset] duration-500 ease-out'
          />
        </svg>
        {/* --- UPDATED: Added classes for perfect centering --- */}
        <span className='text-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold'>
          {Math.round(value)}%
        </span>
      </div>
    )
  }
)
RadialProgress.displayName = 'RadialProgress'

export { RadialProgress }
