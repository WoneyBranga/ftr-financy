import { Field, ID, ObjectType, GraphQLISODateTime } from 'type-graphql'
import { UserModel } from './user.model.js'
import { TransactionModel } from './transaction.model.js'

@ObjectType()
export class CategoryModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  color?: string | null

  @Field(() => String)
  userId!: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date

  @Field(() => UserModel, { nullable: true })
  user?: UserModel | null

  @Field(() => [TransactionModel], { nullable: true })
  transactions?: TransactionModel[] | null
}
