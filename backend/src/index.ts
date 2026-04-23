import 'reflect-metadata'
import './models/transaction-type.enum.js'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { buildSchema } from 'type-graphql'
import { buildContext, type GraphqlContext } from './graphql/context/index.js'
import { AuthResolver } from './resolvers/auth.resolver.js'
import { CategoryResolver } from './resolvers/category.resolver.js'
import { TransactionResolver } from './resolvers/transaction.resolver.js'

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado')
  }

  const schema = await buildSchema({
    resolvers: [AuthResolver, CategoryResolver, TransactionResolver],
    emitSchemaFile: './schema.graphql',
    validate: false,
  })

  const server = new ApolloServer<GraphqlContext>({ schema })
  await server.start()

  const app = express()

  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  )

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: buildContext,
    }),
  )

  const port = Number(process.env.PORT) || 4000
  app.listen(port, () => {
    console.log(`🚀 Financy GraphQL API em http://localhost:${port}/graphql`)
  })
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err)
  process.exit(1)
})
