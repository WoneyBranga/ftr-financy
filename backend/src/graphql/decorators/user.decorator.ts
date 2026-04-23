import { createParameterDecorator } from 'type-graphql'
import type { GraphqlContext } from '../context/index.js'
import { prismaClient } from '../../../prisma/prisma.js'

export function GqlUser() {
  return createParameterDecorator<GraphqlContext>(async ({ context }) => {
    if (!context.user) {
      throw new Error('Não autenticado')
    }

    const user = await prismaClient.user.findUnique({
      where: { id: context.user },
    })

    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return user
  })
}
