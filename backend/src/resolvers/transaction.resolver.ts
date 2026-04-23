import {
  Arg,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { TransactionModel } from '../models/transaction.model.js'
import { CategoryModel } from '../models/category.model.js'
import { UserModel } from '../models/user.model.js'
import { CreateTransactionInput } from '../dtos/input/create-transaction.input.js'
import { UpdateTransactionInput } from '../dtos/input/update-transaction.input.js'
import { TransactionService } from '../services/transaction.service.js'
import { CategoryService } from '../services/category.service.js'
import { IsAuth } from '../middlewares/is-auth.middleware.js'
import { GqlUser } from '../graphql/decorators/user.decorator.js'

@Resolver(() => TransactionModel)
@UseMiddleware(IsAuth)
export class TransactionResolver {
  private transactionService = new TransactionService()
  private categoryService = new CategoryService()

  @Query(() => [TransactionModel])
  transactions(@GqlUser() user: UserModel) {
    return this.transactionService.list(user.id)
  }

  @Query(() => TransactionModel)
  transaction(@Arg('id', () => ID) id: string, @GqlUser() user: UserModel) {
    return this.transactionService.findById(id, user.id)
  }

  @Mutation(() => TransactionModel)
  createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @GqlUser() user: UserModel,
  ) {
    return this.transactionService.create(data, user.id)
  }

  @Mutation(() => TransactionModel)
  updateTransaction(
    @Arg('id', () => ID) id: string,
    @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput,
    @GqlUser() user: UserModel,
  ) {
    return this.transactionService.update(id, data, user.id)
  }

  @Mutation(() => Boolean)
  deleteTransaction(
    @Arg('id', () => ID) id: string,
    @GqlUser() user: UserModel,
  ) {
    return this.transactionService.delete(id, user.id)
  }

  @FieldResolver(() => CategoryModel)
  category(@Root() transaction: TransactionModel, @GqlUser() user: UserModel) {
    return this.categoryService.findById(transaction.categoryId, user.id)
  }
}
