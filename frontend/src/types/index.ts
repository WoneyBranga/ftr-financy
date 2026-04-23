export type TransactionType = 'income' | 'expense'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  transactions?: Transaction[]
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
  category?: Category | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginOutput {
  token: string
  user: User
}

export interface CreateCategoryInput {
  name: string
  color?: string | null
}

export interface UpdateCategoryInput {
  name?: string
  color?: string | null
}

export interface CreateTransactionInput {
  description: string
  amount: number
  type: TransactionType
  date: string
  categoryId: string
}

export interface UpdateTransactionInput {
  description?: string
  amount?: number
  type?: TransactionType
  date?: string
  categoryId?: string
}
