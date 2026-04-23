import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div
          className={cn(
            'flex h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            className,
          )}
        >
          {startIcon ? (
            <span className="text-muted-foreground [&_svg]:size-4">
              {startIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            type={type}
            className="h-full flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          {endIcon ? (
            <span className="text-muted-foreground [&_svg]:size-4">
              {endIcon}
            </span>
          ) : null}
        </div>
      )
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
