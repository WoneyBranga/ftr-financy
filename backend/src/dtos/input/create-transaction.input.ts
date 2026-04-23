import { Field, Float, InputType, GraphQLISODateTime } from 'type-graphql'
import { TransactionType } from '../../models/transaction-type.enum.js'

@InputType()
export class CreateTransactionInput {
  @Field(() => String)
  description!: string

  @Field(() => Float)
  amount!: number

  @Field(() => TransactionType)
  type!: TransactionType

  @Field(() => GraphQLISODateTime)
  date!: Date

  @Field(() => String)
  categoryId!: string
}
