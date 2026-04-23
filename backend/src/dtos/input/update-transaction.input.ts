import { Field, Float, InputType, GraphQLISODateTime } from 'type-graphql'
import { TransactionType } from '../../models/transaction-type.enum.js'

@InputType()
export class UpdateTransactionInput {
  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Float, { nullable: true })
  amount?: number

  @Field(() => TransactionType, { nullable: true })
  type?: TransactionType

  @Field(() => GraphQLISODateTime, { nullable: true })
  date?: Date

  @Field(() => String, { nullable: true })
  categoryId?: string
}
