import { registerEnumType } from 'type-graphql'

export enum TransactionType {
  income = 'income',
  expense = 'expense',
}

registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'Tipo da transação: entrada (income) ou saída (expense)',
})
