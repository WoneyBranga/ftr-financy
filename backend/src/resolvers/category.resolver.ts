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
import { CategoryModel } from '../models/category.model.js'
import { TransactionModel } from '../models/transaction.model.js'
import { UserModel } from '../models/user.model.js'
import { CreateCategoryInput } from '../dtos/input/create-category.input.js'
import { UpdateCategoryInput } from '../dtos/input/update-category.input.js'
import { CategoryService } from '../services/category.service.js'
import { TransactionService } from '../services/transaction.service.js'
import { IsAuth } from '../middlewares/is-auth.middleware.js'
import { GqlUser } from '../graphql/decorators/user.decorator.js'

@Resolver(() => CategoryModel)
@UseMiddleware(IsAuth)
export class CategoryResolver {
  private categoryService = new CategoryService()
  private transactionService = new TransactionService()

  @Query(() => [CategoryModel])
  categories(@GqlUser() user: UserModel) {
    return this.categoryService.list(user.id)
  }

  @Query(() => CategoryModel)
  category(@Arg('id', () => ID) id: string, @GqlUser() user: UserModel) {
    return this.categoryService.findById(id, user.id)
  }

  @Mutation(() => CategoryModel)
  createCategory(
    @Arg('data', () => CreateCategoryInput) data: CreateCategoryInput,
    @GqlUser() user: UserModel,
  ) {
    return this.categoryService.create(data, user.id)
  }

  @Mutation(() => CategoryModel)
  updateCategory(
    @Arg('id', () => ID) id: string,
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @GqlUser() user: UserModel,
  ) {
    return this.categoryService.update(id, data, user.id)
  }

  @Mutation(() => Boolean)
  deleteCategory(
    @Arg('id', () => ID) id: string,
    @GqlUser() user: UserModel,
  ) {
    return this.categoryService.delete(id, user.id)
  }

  @FieldResolver(() => [TransactionModel])
  transactions(@Root() category: CategoryModel, @GqlUser() user: UserModel) {
    return this.transactionService.listByCategory(category.id, user.id)
  }
}
