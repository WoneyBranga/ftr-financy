import { prismaClient } from '../../prisma/prisma.js'
import { comparePassword, hashPassword } from '../utils/hash.js'
import { signJwt } from '../utils/jwt.js'
import type { RegisterInput } from '../dtos/input/register.input.js'
import type { LoginInput } from '../dtos/input/login.input.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class AuthService {
  async register(input: RegisterInput) {
    const name = input.name?.trim()
    const email = input.email?.trim().toLowerCase()
    const password = input.password

    if (!name) {
      throw new Error('O nome é obrigatório')
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new Error('Email inválido')
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter ao menos 6 caracteres')
    }

    const existing = await prismaClient.user.findUnique({ where: { email } })
    if (existing) {
      throw new Error('Email já cadastrado')
    }

    const hashed = await hashPassword(password)
    const user = await prismaClient.user.create({
      data: { name, email, password: hashed },
    })

    const token = signJwt({ id: user.id })
    return { token, user }
  }

  async login(input: LoginInput) {
    const email = input.email?.trim().toLowerCase()
    const password = input.password

    if (!email || !password) {
      throw new Error('Credenciais inválidas')
    }

    const user = await prismaClient.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('Credenciais inválidas')
    }

    const ok = await comparePassword(password, user.password)
    if (!ok) {
      throw new Error('Credenciais inválidas')
    }

    const token = signJwt({ id: user.id })
    return { token, user }
  }
}
