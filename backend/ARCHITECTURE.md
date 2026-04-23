## Arquitetura — Backend (Mindshare)

Este documento descreve a arquitetura, padrões, organização de pastas, bibliotecas e convenções usadas no backend, de forma que um novo projeto possa ser construído replicando o mesmo padrão.

---

### 1. Visão geral

- **Tipo de aplicação:** API GraphQL
- **Linguagem:** TypeScript (ESM)
- **Runtime:** Node.js (executado em dev com `tsx watch`)
- **Servidor HTTP:** Express 5
- **Camada GraphQL:** Apollo Server 5 + integração `@as-integrations/express5`
- **Schema GraphQL:** gerado via **TypeGraphQL** (code-first, decorators + `reflect-metadata`)
- **ORM:** Prisma 6 (SQLite em dev)
- **Autenticação:** JWT (`jsonwebtoken`) + hash de senha com `bcryptjs`
- **Padrão arquitetural:** Arquitetura em camadas (Resolver → Service → Prisma), separando transporte (GraphQL), regras de negócio (services) e dados (Prisma Client).

---

### 2. Stack / Bibliotecas

#### Dependências principais
- `@apollo/server` — servidor GraphQL
- `@as-integrations/express5` — middleware para plugar Apollo no Express 5
- `type-graphql` — schema GraphQL code-first baseado em decorators
- `reflect-metadata` — necessário para os decorators (deve ser importado **antes de tudo** no `index.ts`)
- `graphql` — peer dependency do TypeGraphQL/Apollo
- `@prisma/client` / `prisma` — ORM e CLI de migrations
- `express`, `cors` — HTTP e CORS
- `jsonwebtoken` — geração/validação de JWT
- `bcryptjs` — hash de senha

#### Dev
- `tsx` — executor TS em watch mode
- `typescript` — `experimentalDecorators` + `emitDecoratorMetadata` habilitados
- `@types/*`

#### Scripts (`package.json`)
- `dev`: `tsx watch src/index.ts`
- `seed`: `tsx prisma/seed.ts`
- `migrate`: `prisma migrate dev`
- `generate`: `prisma generate`

---

### 3. Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma        # Schema do banco (models + enums)
│   ├── prisma.ts            # Singleton do PrismaClient
│   ├── seed.ts              # Seed do banco
│   ├── dev.db               # Banco SQLite local
│   └── migrations/          # Migrations versionadas
├── src/
│   ├── index.ts             # Bootstrap: Express + Apollo + TypeGraphQL
│   ├── dtos/
│   │   ├── input/           # @InputType() — inputs de mutations/queries
│   │   └── output/          # @ObjectType() — outputs customizados (ex.: LoginOutput)
│   ├── models/              # @ObjectType() — modelos GraphQL (espelham entidades Prisma)
│   ├── resolvers/           # @Resolver() — camada de transporte GraphQL
│   ├── services/            # Regras de negócio e acesso ao Prisma
│   ├── middlewares/         # MiddlewareFn do TypeGraphQL (ex.: IsAuth)
│   ├── graphql/
│   │   ├── context/         # buildContext (extrai user do JWT)
│   │   └── decorators/      # Parameter decorators custom (ex.: @GqlUser())
│   └── utils/               # Utilitários puros (hash, jwt)
├── schema.graphql           # SDL emitido automaticamente pelo TypeGraphQL
├── tsconfig.json
└── package.json
```

Regra geral: **cada entidade de domínio possui um arquivo por camada**, sempre com o sufixo:
`entidade.model.ts`, `entidade.resolver.ts`, `entidade.service.ts`, `entidade.input.ts`.

---

### 4. Camadas e responsabilidades

#### 4.1 Bootstrap (`src/index.ts`)
1. Importa `reflect-metadata` como **primeira linha**.
2. Cria o `express()` e habilita CORS com `credentials: true` e `origin` do frontend.
3. Constrói o schema com `buildSchema({ resolvers, emitSchemaFile: './schema.graphql', validate: false })`.
4. Cria `ApolloServer({ schema })`, `await server.start()`.
5. Monta o middleware em `/graphql` passando `buildContext`.
6. `app.listen(4000)`.

#### 4.2 Models (`src/models/*.model.ts`)
- Classes TypeScript com `@ObjectType()`.
- Cada campo mapeado com `@Field(() => Tipo)` (incluindo `ID`, `GraphQLISODateTime`, `Number`, arrays e relações nullable).
- Campos relacionais (ex.: `author`, `comments`, `votes`) são declarados **nullable** e resolvidos por `@FieldResolver` no resolver correspondente (evita eager-loading desnecessário).

#### 4.3 DTOs (`src/dtos/input` e `src/dtos/output`)
- `@InputType()` para entradas — ex.: `CreateIdeaInput`, `UpdateIdeaInput`, `LoginInput`, `RegisterInput`.
- `@ObjectType()` para saídas compostas que não são entidades — ex.: `LoginOutput { token, refreshToken, user }`.
- Campos opcionais usam `{ nullable: true }` e `?` no TS.

#### 4.4 Resolvers (`src/resolvers/*.resolver.ts`)
- Classes com `@Resolver(() => Model)`.
- Autenticação aplicada no nível da classe via `@UseMiddleware(IsAuth)` (exceto `AuthResolver`, que deve ser público para `login`/`register`).
- Instanciam os services como **propriedades privadas** (`private service = new Service()`), sem container de DI.
- Delegam 100% da lógica aos services.
- Usam decorators:
  - `@Query(() => Type)` / `@Mutation(() => Type)`
  - `@Arg('name', () => Type)`
  - `@FieldResolver()` + `@Root()` para resolver relações
  - `@GqlUser()` (custom) para injetar o usuário autenticado como `UserModel`

Exemplo de padrão (resumido):
```ts
@Resolver(() => IdeaModel)
@UseMiddleware(IsAuth)
export class IdeaResolver {
  private ideaService = new IdeaService()

  @Mutation(() => IdeaModel)
  createIdea(@Arg('data') data: CreateIdeaInput, @GqlUser() user: UserModel) {
    return this.ideaService.createIdea(data, user.id)
  }

  @FieldResolver(() => [CommentModel])
  comments(@Root() idea: IdeaModel) {
    return this.commentService.listCommentsByIdea(idea.id)
  }
}
```

#### 4.5 Services (`src/services/*.service.ts`)
- Classes simples com métodos `async`.
- Acessam o banco via `prismaClient` importado de `prisma/prisma.ts`.
- **Lançam `Error(...)` em português** para casos não encontrados / inválidos (esses erros são propagados pelo Apollo).
- Não conhecem nada sobre GraphQL (não importam `type-graphql`).

#### 4.6 Middlewares (`src/middlewares/`)
- Arquivos exportam `MiddlewareFn<GraphqlContext>`.
- Ex.: `IsAuth` — verifica `context.user` e aborta se ausente.

#### 4.7 Context GraphQL (`src/graphql/context/index.ts`)
- `buildContext({ req, res })`:
  - Lê `Authorization: Bearer <token>`.
  - Valida o JWT via `verifyJwt`.
  - Expõe `{ user: id | undefined, token, req, res }` como `GraphqlContext`.
- O contexto **não** carrega o usuário completo; só o `id`. O usuário completo é buscado sob demanda pelo decorator `@GqlUser`.

#### 4.8 Parameter decorator custom (`src/graphql/decorators/user.decorator.ts`)
- `GqlUser()` usa `createParameterDecorator` do TypeGraphQL para buscar o usuário no Prisma a partir de `context.user` e injetá-lo no resolver.

#### 4.9 Utils (`src/utils/`)
- `jwt.ts`: `signJwt(payload, expiresIn?)` e `verifyJwt(token)`. Segredo em `process.env.JWT_SECRET`.
- `hash.ts`: wrappers de `bcryptjs` para hash/compare de senhas.

#### 4.10 Prisma (`prisma/`)
- `schema.prisma` — models com UUID (`@default(uuid())`), `createdAt`/`updatedAt`, relações com `onDelete: Cascade`, `@@unique` onde necessário (ex.: `Vote` por `[userId, ideaId]`).
- `prisma.ts` — **singleton** do `PrismaClient` reusando `globalThis.prisma` (evita múltiplas instâncias em hot-reload).
- `seed.ts` — script rodado via `prisma db seed` (`tsx prisma/seed.ts`).
- Enum `Role` (`owner | admin | member | viewer`).

---

### 5. Convenções

- **ESM** (`"type": "module"`) com `moduleResolution: node`.
- **Nomes de arquivo:** `kebab-case.camada.ts` (ex.: `idea.resolver.ts`).
- **Nomes de classe:** PascalCase com sufixo da camada (`IdeaService`, `IdeaResolver`, `IdeaModel`).
- **Idioma:** mensagens de erro em português.
- **Schema GraphQL:** gerado automaticamente em `schema.graphql` via `emitSchemaFile` — **nunca editar à mão**.
- **Autenticação:** protege-se no resolver com `@UseMiddleware(IsAuth)`. Resolvers públicos (auth) não levam o middleware.
- **Sem DI container** — instância direta de services nos resolvers.
- **Sem validação automática** (`validate: false`); validação fica nos services.

---

### 6. Fluxo de uma request típica

1. Cliente envia `POST /graphql` com `Authorization: Bearer <jwt>`.
2. Express → Apollo Server → `buildContext` decodifica o JWT e popula `context.user`.
3. Apollo invoca o resolver correspondente.
4. `@UseMiddleware(IsAuth)` garante usuário autenticado.
5. `@GqlUser()` carrega o `UserModel` do Prisma se necessário.
6. Resolver chama o `Service`, que fala com o `prismaClient`.
7. Retorno é serializado conforme o `@ObjectType()` / `@FieldResolver`.

---

### 7. Variáveis de ambiente

- `DATABASE_URL` — string de conexão do Prisma (ex.: `file:./dev.db`).
- `JWT_SECRET` — segredo usado por `signJwt`/`verifyJwt`.

---

### 8. Passo a passo para replicar em novo projeto

1. `npm init -y` e `"type": "module"`.
2. Instalar deps principais e dev (ver seção 2).
3. Criar `tsconfig.json` com `experimentalDecorators` e `emitDecoratorMetadata` habilitados, `target: es2023`, `module: esnext`, `moduleResolution: node`.
4. `npx prisma init` → configurar `schema.prisma` e criar `prisma/prisma.ts` como singleton.
5. Criar `src/index.ts` com o bootstrap (import `reflect-metadata` primeiro).
6. Para cada entidade criar o quarteto `model / input / service / resolver`.
7. Implementar `graphql/context`, `middlewares/auth.middleware`, `graphql/decorators/user.decorator`, `utils/jwt`, `utils/hash`.
8. `AuthResolver` público + demais resolvers com `@UseMiddleware(IsAuth)`.
9. Registrar todos os resolvers no array `resolvers: [...]` do `buildSchema`.
10. Scripts `dev`, `migrate`, `generate`, `seed` no `package.json`.
