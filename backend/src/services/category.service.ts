import { Prisma } from '@prisma/client'
import { prismaClient } from '../../prisma/prisma.js'
import type { CreateCategoryInput } from '../dtos/input/create-category.input.js'
import type { UpdateCategoryInput } from '../dtos/input/update-category.input.js'

export class CategoryService {
  list(userId: string) {
    return prismaClient.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
  }

  async findById(id: string, userId: string) {
    const category = await prismaClient.category.findFirst({
      where: { id, userId },
    })
    if (!category) {
      throw new Error('Categoria não encontrada')
    }
    return category
  }

  async create(data: CreateCategoryInput, userId: string) {
    const name = data.name?.trim()
    if (!name) {
      throw new Error('O nome da categoria é obrigatório')
    }

    try {
      return await prismaClient.category.create({
        data: {
          name,
          color: data.color ?? null,
          userId,
        },
      })
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new Error('Já existe uma categoria com esse nome')
      }
      throw err
    }
  }

  async update(id: string, data: UpdateCategoryInput, userId: string) {
    const patch: { name?: string; color?: string | null } = {}
    if (data.name !== undefined) {
      const name = data.name?.trim()
      if (!name) {
        throw new Error('O nome da categoria é obrigatório')
      }
      patch.name = name
    }
    if (data.color !== undefined) {
      patch.color = data.color
    }

    try {
      const result = await prismaClient.category.updateMany({
        where: { id, userId },
        data: patch,
      })
      if (result.count === 0) {
        throw new Error('Categoria não encontrada')
      }
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new Error('Já existe uma categoria com esse nome')
      }
      throw err
    }

    return this.findById(id, userId)
  }

  async delete(id: string, userId: string) {
    const result = await prismaClient.category.deleteMany({
      where: { id, userId },
    })
    if (result.count === 0) {
      throw new Error('Categoria não encontrada')
    }
    return true
  }
}
