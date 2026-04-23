import type { MiddlewareFn } from 'type-graphql'
import type { GraphqlContext } from '../graphql/context/index.js'

export const IsAuth: MiddlewareFn<GraphqlContext> = ({ context }, next) => {
  if (!context.user) {
    throw new Error('Não autenticado')
  }
  return next()
}
