import { prismaClient } from './prisma.js'
import bcrypt from 'bcryptjs'

const DEMO_EMAIL = 'demo@financy.dev'
const DEMO_PASSWORD = 'demo1234'

async function main() {
  const existing = await prismaClient.user.findUnique({
    where: { email: DEMO_EMAIL },
  })

  if (existing) {
    console.log(`Usuário demo já existe (${DEMO_EMAIL}), pulando seed.`)
    return
  }

  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10)

  const user = await prismaClient.user.create({
    data: {
      name: 'Demo Financy',
      email: DEMO_EMAIL,
      password: hashed,
    },
  })

  const [alimentacao, transporte, salario] = await Promise.all([
    prismaClient.category.create({
      data: { name: 'Alimentação', color: '#F87171', userId: user.id },
    }),
    prismaClient.category.create({
      data: { name: 'Transporte', color: '#60A5FA', userId: user.id },
    }),
    prismaClient.category.create({
      data: { name: 'Salário', color: '#34D399', userId: user.id },
    }),
  ])

  await prismaClient.transaction.createMany({
    data: [
      {
        description: 'Salário mensal',
        amount: 5000,
        type: 'income',
        date: new Date('2026-04-01'),
        userId: user.id,
        categoryId: salario.id,
      },
      {
        description: 'Supermercado',
        amount: 420.75,
        type: 'expense',
        date: new Date('2026-04-05'),
        userId: user.id,
        categoryId: alimentacao.id,
      },
      {
        description: 'Uber para o trabalho',
        amount: 28.5,
        type: 'expense',
        date: new Date('2026-04-10'),
        userId: user.id,
        categoryId: transporte.id,
      },
      {
        description: 'Jantar com amigos',
        amount: 85.0,
        type: 'expense',
        date: new Date('2026-04-15'),
        userId: user.id,
        categoryId: alimentacao.id,
      },
      {
        description: 'Gasolina',
        amount: 220.0,
        type: 'expense',
        date: new Date('2026-04-18'),
        userId: user.id,
        categoryId: transporte.id,
      },
    ],
  })

  console.log(`✅ Seed concluído. Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
}

main()
  .catch((err) => {
    console.error('Erro no seed:', err)
    process.exit(1)
  })
  .finally(() => prismaClient.$disconnect())
