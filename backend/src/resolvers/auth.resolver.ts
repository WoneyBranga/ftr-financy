import { Arg, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { UserModel } from '../models/user.model.js'
import { LoginOutput } from '../dtos/output/login.output.js'
import { RegisterInput } from '../dtos/input/register.input.js'
import { LoginInput } from '../dtos/input/login.input.js'
import { AuthService } from '../services/auth.service.js'
import { IsAuth } from '../middlewares/is-auth.middleware.js'
import { GqlUser } from '../graphql/decorators/user.decorator.js'

@Resolver(() => UserModel)
export class AuthResolver {
  private authService = new AuthService()

  @Mutation(() => LoginOutput)
  register(@Arg('data', () => RegisterInput) data: RegisterInput) {
    return this.authService.register(data)
  }

  @Mutation(() => LoginOutput)
  login(@Arg('data', () => LoginInput) data: LoginInput) {
    return this.authService.login(data)
  }

  @Query(() => UserModel)
  @UseMiddleware(IsAuth)
  me(@GqlUser() user: UserModel) {
    return user
  }
}
