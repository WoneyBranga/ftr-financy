import { cn } from '@/lib/utils'

interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Page({ className, children, ...props }: PageProps) {
  return (
    <div
      className={cn('mx-auto w-full max-w-6xl px-6 py-10', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
