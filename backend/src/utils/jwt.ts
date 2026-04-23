import jwt, { type SignOptions } from 'jsonwebtoken'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não configurado')
  }
  return secret
}

export interface JwtPayload {
  id: string
}

export function signJwt(payload: JwtPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, getSecret(), { expiresIn })
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload
}
