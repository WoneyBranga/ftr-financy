import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (error) {
      console.log(error)
      toast.error('E-mail ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <Logo className="text-primary" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">Fazer login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="mail@exemplo.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                startIcon={<Mail />}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                startIcon={<Lock />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(value) => setRemember(value === true)}
                />
                Lembrar-me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-primary hover:underline"
              >
                Recuperar senha
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase text-muted-foreground">
              ou
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Ainda não tem uma conta?
            </p>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to="/signup">
                <UserPlus className="h-4 w-4" />
                Criar conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
