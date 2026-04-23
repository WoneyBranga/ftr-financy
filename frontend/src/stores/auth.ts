import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apolloClient } from '@/lib/graphql/apollo'
import { LOGIN } from '@/lib/graphql/mutations/Login'
import { REGISTER } from '@/lib/graphql/mutations/Register'
import type {
  LoginInput,
  LoginOutput,
  RegisterInput,
  User,
} from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  signup: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (input) => {
        const { data } = await apolloClient.mutate<
          { login: LoginOutput },
          { data: LoginInput }
        >({
          mutation: LOGIN,
          variables: { data: input },
        })
        if (!data) throw new Error('Falha ao autenticar')
        set({
          token: data.login.token,
          user: data.login.user,
          isAuthenticated: true,
        })
      },

      signup: async (input) => {
        const { data } = await apolloClient.mutate<
          { register: LoginOutput },
          { data: RegisterInput }
        >({
          mutation: REGISTER,
          variables: { data: input },
        })
        if (!data) throw new Error('Falha ao cadastrar')
        set({
          token: data.register.token,
          user: data.register.user,
          isAuthenticated: true,
        })
      },

      logout: async () => {
        set({ token: null, user: null, isAuthenticated: false })
        await apolloClient.clearStore()
      },
    }),
    {
      name: 'financy-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
