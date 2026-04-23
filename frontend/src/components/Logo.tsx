import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'full' | 'mark'
}

export function Logo({ className, variant = 'full' }: LogoProps) {
  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 32 32"
        className={cn('h-8 w-8 text-primary', className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="21" cy="21" r="8" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M8 11h6M11 8v6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 text-primary', className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="21" cy="21" r="8" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M8 11h6M11 8v6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-extrabold tracking-tight">FINANCY</span>
    </div>
  )
}
