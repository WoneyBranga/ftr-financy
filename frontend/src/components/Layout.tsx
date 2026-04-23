import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/sonner'

export function Layout() {
  const location = useLocation()
  const isAuthRoute =
    location.pathname === '/login' || location.pathname === '/signup'

  return (
    <div className="flex min-h-full flex-col bg-background">
      {!isAuthRoute ? <Header /> : null}
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
