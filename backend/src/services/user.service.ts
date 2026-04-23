import { prismaClient } from '../../prisma/prisma.js'

export class UserService {
  findById(id: string) {
    return prismaClient.user.findUnique({ where: { id } })
  }

  findByEmail(email: string) {
    return prismaClient.user.findUnique({ where: { email } })
  }
}
