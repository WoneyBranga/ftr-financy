import { prismaClient } from '../../prisma/prisma.js'
import type { CreateTransactionInput } from '../dtos/input/create-transaction.input.js'
import type { UpdateTransactionInput } from '../dtos/input/update-transaction.input.js'
import { TransactionType } from '../models/transaction-type.enum.js'

function isValidType(value: string): value is TransactionType {
  return value === TransactionType.income || value === TransactionType.expense
}

async function ensureCategoryBelongsToUser(categoryId: string, userId: string) {
  const category = await prismaClient.category.findFirst({
    where: { id: categoryId, userId },
  })
  if (!category) {
    throw new Error('Categoria não pertence ao usuário')
  }
}

export class TransactionService {
  list(userId: string) {
    return prismaClient.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  }

  listByCategory(categoryId: string, userId: string) {
    return prismaClient.transaction.findMany({
      where: { categoryId, userId },
      orderBy: { date: 'desc' },
    })
  }

  async findById(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findFirst({
      where: { id, userId },
    })
    if (!transaction) {
      throw new Error('Transação não encontrada')
    }
    return transaction
  }

  async create(data: CreateTransactionInput, userId: string) {
    const description = data.description?.trim()
    if (!description) {
      throw new Error('A descrição é obrigatória')
    }
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new Error('O valor deve ser maior que zero')
    }
    if (!isValidType(data.type)) {
      throw new Error('Tipo de transação inválido')
    }
    if (!data.date || Number.isNaN(new Date(data.date).getTime())) {
      throw new Error('Data inválida')
    }

    await ensureCategoryBelongsToUser(data.categoryId, userId)

    return prismaClient.transaction.create({
      data: {
        description,
        amount: data.amount,
        type: data.type,
        date: new Date(data.date),
        categoryId: data.categoryId,
        userId,
      },
    })
  }

  async update(id: string, data: UpdateTransactionInput, userId: string) {
    const patch: {
      description?: string
      amount?: number
      type?: string
      date?: Date
      categoryId?: string
    } = {}

    if (data.description !== undefined) {
      const description = data.description?.trim()
      if (!description) {
        throw new Error('A descrição é obrigatória')
      }
      patch.description = description
    }
    if (data.amount !== undefined) {
      if (!Number.isFinite(data.amount) || data.amount <= 0) {
        throw new Error('O valor deve ser maior que zero')
      }
      patch.amount = data.amount
    }
    if (data.type !== undefined) {
      if (!isValidType(data.type)) {
        throw new Error('Tipo de transação inválido')
      }
      patch.type = data.type
    }
    if (data.date !== undefined) {
      if (!data.date || Number.isNaN(new Date(data.date).getTime())) {
        throw new Error('Data inválida')
      }
      patch.date = new Date(data.date)
    }
    if (data.categoryId !== undefined) {
      await ensureCategoryBelongsToUser(data.categoryId, userId)
      patch.categoryId = data.categoryId
    }

    const result = await prismaClient.transaction.updateMany({
      where: { id, userId },
      data: patch,
    })
    if (result.count === 0) {
      throw new Error('Transação não encontrada')
    }

    return this.findById(id, userId)
  }

  async delete(id: string, userId: string) {
    const result = await prismaClient.transaction.deleteMany({
      where: { id, userId },
    })
    if (result.count === 0) {
      throw new Error('Transação não encontrada')
    }
    return true
  }
}
