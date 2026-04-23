import type { Request, Response } from 'express'
import { verifyJwt } from '../../utils/jwt.js'

export interface GraphqlContext {
  user: string | undefined
  token: string | undefined
  req: Request
  res: Response
}

export async function buildContext({
  req,
  res,
}: {
  req: Request
  res: Response
}): Promise<GraphqlContext> {
  const header = req.headers.authorization ?? ''
  const [, token] = header.split(' ')

  if (!token) {
    return { user: undefined, token: undefined, req, res }
  }

  try {
    const payload = verifyJwt(token)
    return { user: payload.id, token, req, res }
  } catch {
    return { user: undefined, token, req, res }
  }
}
