## Arquitetura — Frontend (Mindshare)

Este documento descreve a arquitetura, padrões, organização de pastas, bibliotecas e convenções usadas no frontend, servindo como guia para replicar o mesmo padrão em um novo projeto.

---

### 1. Visão geral

- **Framework:** React 19 (SPA)
- **Bundler/dev server:** Vite 7
- **Linguagem:** TypeScript
- **Roteamento:** `react-router-dom` v7 (BrowserRouter)
- **Estilo:** TailwindCSS 3 + `tailwindcss-animate`, utilitário `cn` (`clsx` + `tailwind-merge`)
- **UI kit:** shadcn/ui (componentes em `src/components/ui`) baseados em Radix UI
- **Cliente GraphQL:** Apollo Client 4 (`@apollo/client`)
- **Gerenciamento de estado global:** Zustand (+ middleware `persist` para auth)
- **Notificações:** `sonner`
- **Ícones:** `lucide-react`
- **Drawer:** `vaul`
- **Padrão:** Feature-based organization — cada página (feature) tem sua pasta com componentes locais; estado global e camada de dados ficam em `stores/` e `lib/graphql/`.

---

### 2. Stack / Bibliotecas

#### Dependências
- `react`, `react-dom` 19
- `react-router-dom` 7 — roteamento
- `@apollo/client`, `graphql` — GraphQL client
- `zustand` — estado global
- `@radix-ui/react-*` (avatar, dialog, label, slot) — primitivos acessíveis
- `class-variance-authority`, `clsx`, `tailwind-merge` — composição de classes utilitárias
- `tailwindcss`, `tailwindcss-animate`, `@tailwindcss/vite`, `autoprefixer`, `postcss`
- `lucide-react` — ícones
- `sonner` — toasts
- `vaul` — drawer
- `next-themes` — suporte a tema (via Toaster do shadcn)

#### Dev
- `vite`, `@vitejs/plugin-react`
- `typescript`, `typescript-eslint`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

#### Scripts
- `dev`: `vite`
- `build`: `tsc -b && vite build`
- `lint`: `eslint .`
- `preview`: `vite preview`

#### Alias
Em `vite.config.ts` e `tsconfig.json`:
```ts
"@/*" -> "src/*"
```

---

### 3. Estrutura de pastas

```
frontend/
├── index.html
├── vite.config.ts           # Plugin React + alias "@" → ./src
├── tailwind.config.js
├── postcss.config.js
├── components.json          # Config do shadcn/ui
├── tsconfig.json / tsconfig.node.json
└── src/
    ├── main.tsx             # Bootstrap: StrictMode + ApolloProvider + BrowserRouter
    ├── App.tsx              # Rotas + Layout + ProtectedRoute/PublicRoute
    ├── index.css            # Tailwind base + variáveis do shadcn
    ├── assets/              # Logos e imagens
    ├── components/
    │   ├── Header.tsx
    │   ├── Layout.tsx       # Shell global (Header + main + Toaster)
    │   ├── Page.tsx         # Wrapper de página
    │   └── ui/              # Componentes shadcn/ui (button, card, dialog, drawer...)
    ├── lib/
    │   ├── utils.ts         # cn(), helpers
    │   └── graphql/
    │       ├── apollo.ts    # ApolloClient + authLink
    │       ├── queries/     # gql`query ...`
    │       └── mutations/   # gql`mutation ...`
    ├── pages/
    │   ├── Auth/
    │   │   ├── Login.tsx
    │   │   └── Signup.tsx
    │   ├── Ideias/
    │   │   ├── index.tsx
    │   │   └── components/  # componentes locais da feature (Cards, Dialogs, Drawers)
    │   └── Members/
    │       ├── index.tsx
    │       └── components/
    ├── stores/
    │   └── auth.ts          # Zustand store (persist)
    └── types/
        └── index.ts         # Tipagens de domínio (User, Idea, Comment, Vote, inputs)
```

Regra geral: **pages/<Feature>/index.tsx** concentra a página e, se necessário, tem uma pasta `components/` co-localizada com componentes usados **somente** por ela.

---

### 4. Camadas e responsabilidades

#### 4.1 Bootstrap (`src/main.tsx`)
Ordem dos providers (do externo para o interno):
```tsx
<StrictMode>
  <ApolloProvider client={apolloClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
</StrictMode>
```

#### 4.2 Roteamento (`src/App.tsx`)
- `Routes` envolvido pelo `<Layout>` (header + main + toaster).
- Guardas de rota:
  - `ProtectedRoute` — redireciona para `/login` se `!isAuthenticated`.
  - `PublicRoute` — redireciona para `/` se já autenticado (usado em `/login`, `/signup`).
- O estado de auth vem do Zustand (`useAuthStore`).

#### 4.3 Apollo Client (`src/lib/graphql/apollo.ts`)
- `HttpLink` para `http://localhost:4000/graphql`.
- `SetContextLink` (`@apollo/client/link/context`) lê o token do Zustand via `useAuthStore.getState().token` e injeta `Authorization: Bearer <token>`.
- `InMemoryCache`.
- Exportado como `apolloClient` — usado no Provider **e** diretamente pelo store de auth (para `mutate` fora de componentes).

#### 4.4 GraphQL (`src/lib/graphql/`)
- Operações tipadas com template literals `gql`...``.
- Separação por tipo: `queries/` e `mutations/`.
- **Um arquivo por operação/entidade** (ex.: `mutations/Login.ts`, `queries/Ideia.ts`).
- Nome da constante em **UPPER_SNAKE_CASE** (ex.: `LOGIN`, `LIST_IDEAS`).

Consumo nos componentes:
```tsx
const { data, loading, refetch } = useQuery<{ listIdeas: Idea[] }>(LIST_IDEAS)
const [mutate] = useMutation<DataT, VarsT>(LOGIN)
```

#### 4.5 Estado global — Zustand (`src/stores/auth.ts`)
- Store criado com `create<AuthState>()(persist(..., { name: 'auth-storage' }))`.
- Persiste token + user em `localStorage`.
- Ações assíncronas (`login`, `signup`) chamam `apolloClient.mutate` diretamente e atualizam o estado.
- `logout` limpa estado e executa `apolloClient.clearStore()`.
- **Regra:** estado de autenticação e dados globais ficam no Zustand. Dados remotos por página ficam no cache do Apollo (hooks `useQuery`).

#### 4.6 Types (`src/types/index.ts`)
- Interfaces de domínio (User, Idea, Comment, Vote) e de input (LoginInput, RegisterInput).
- Usadas tanto pelos stores quanto pelos componentes.

#### 4.7 UI / Design System
- **shadcn/ui**: componentes copiados para `src/components/ui/*` (button, card, dialog, drawer, input, label, textarea, avatar, sonner).
- Configuração em `components.json`.
- Estilização via variantes com `class-variance-authority` e utilitário `cn()` de `src/lib/utils.ts`.
- Tailwind config com `tailwindcss-animate` e variáveis CSS (tema) em `index.css`.
- Ícones via `lucide-react`.

#### 4.8 Layout e páginas
- `Layout.tsx`: wrapper global (fundo, `Header`, `<main>`, `<Toaster />`).
- `Page.tsx`: wrapper de conteúdo da página (container/spacing consistentes).
- Feature pages seguem o padrão:
  ```tsx
  export function IdeasPage() {
    const [openDialog, setOpenDialog] = useState(false)
    const { data, loading, refetch } = useQuery<{ listIdeas: Idea[] }>(LIST_IDEAS)
    return (
      <Page>
        {/* header da página */}
        {/* grid com IdeaCard */}
        <CreateIdeaDialog open={openDialog} onOpenChange={setOpenDialog} onCreated={() => refetch()} />
      </Page>
    )
  }
  ```
- Dialogs/Drawers recebem `open`, `onOpenChange` e callbacks `onCreated/onUpdated/onDeleted` que disparam `refetch()` do parent.

---

### 5. Convenções

- **Arquivos de componente:** PascalCase (`IdeaCard.tsx`, `CreateIdeaDialog.tsx`).
- **Arquivos de hooks/utils/stores:** camelCase (`auth.ts`, `utils.ts`).
- **Operações GraphQL:** PascalCase no nome do arquivo (`Login.ts`, `Ideia.ts`), constante `UPPER_SNAKE_CASE`.
- **Imports com alias `@/`** preferenciais para `components`, `lib`, `stores`, `types`. (Imports relativos também ocorrem dentro da mesma feature.)
- **Idioma da UI:** português.
- **Tema:** claro, com acentos em `purple-600` (ex.: títulos das páginas).
- **Tratamento de erro:** `try/catch` com `console.log` + `toast` (sonner) no componente.

---

### 6. Fluxo de autenticação

1. Usuário submete formulário em `Login`/`Signup`.
2. Componente chama `useAuthStore().login(...)` / `.signup(...)`.
3. Store executa `apolloClient.mutate(LOGIN|REGISTER)`.
4. Em sucesso, salva `token` + `user` no Zustand (persistido em `localStorage` sob `auth-storage`).
5. Próximas requisições GraphQL passam pelo `authLink`, que injeta o header `Authorization` a partir do store.
6. `ProtectedRoute` libera acesso às páginas internas.
7. `logout` limpa store e faz `apolloClient.clearStore()`.

---

### 7. Passo a passo para replicar em novo projeto

1. `npm create vite@latest app -- --template react-ts`.
2. Instalar: `@apollo/client graphql zustand react-router-dom lucide-react sonner vaul class-variance-authority clsx tailwind-merge`.
3. Instalar Tailwind 3 + `tailwindcss-animate` + `postcss` + `autoprefixer`; configurar `tailwind.config.js` e `index.css` com as camadas do shadcn.
4. Rodar `npx shadcn@latest init` e adicionar componentes conforme necessário (`button`, `card`, `dialog`, `drawer`, `input`, `label`, `textarea`, `avatar`, `sonner`).
5. Configurar alias `@` em `vite.config.ts` e `tsconfig.json`.
6. Criar `src/lib/graphql/apollo.ts` com `HttpLink` + `SetContextLink` lendo o token do store.
7. Criar `src/stores/auth.ts` com Zustand + `persist`.
8. Envolver `App` com `ApolloProvider` e `BrowserRouter` em `main.tsx`.
9. Definir rotas em `App.tsx` com `ProtectedRoute`/`PublicRoute` + `Layout` global.
10. Criar `src/types/index.ts` com as interfaces do domínio.
11. Organizar páginas em `src/pages/<Feature>/index.tsx` com `components/` locais; centralizar operações GraphQL em `src/lib/graphql/{queries,mutations}/`.
