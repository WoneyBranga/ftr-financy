import { Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/Auth/Login'
import { SignupPage } from '@/pages/Auth/Signup'
import { DashboardPage } from '@/pages/Dashboard'
import { TransactionsPage } from '@/pages/Transactions'
import { CategoriesPage } from '@/pages/Categories'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transacoes" element={<TransactionsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
