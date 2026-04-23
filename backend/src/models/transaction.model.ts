import { Field, Float, ID, ObjectType, GraphQLISODateTime } from 'type-graphql'
import { TransactionType } from './transaction-type.enum.js'
import { UserModel } from './user.model.js'
import { CategoryModel } from './category.model.js'

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  description!: string

  @Field(() => Float)
  amount!: number

  @Field(() => TransactionType)
  type!: TransactionType

  @Field(() => GraphQLISODateTime)
  date!: Date

  @Field(() => String)
  userId!: string

  @Field(() => String)
  categoryId!: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date

  @Field(() => UserModel, { nullable: true })
  user?: UserModel | null

  @Field(() => CategoryModel, { nullable: true })
  category?: CategoryModel | null
}
