import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { useAuthStore } from '@/stores/auth'

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000/graphql',
})

const authLink = new SetContextLink((prevContext) => {
  const token = useAuthStore.getState().token
  const prevHeaders =
    (prevContext.headers as Record<string, string> | undefined) ?? {}
  return {
    headers: {
      ...prevHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
