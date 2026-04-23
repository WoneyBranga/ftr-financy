# 💜 Financy

Aplicação FullStack de gerenciamento de finanças pessoais, desenvolvida como desafio da Fase 3 da Pós-Graduação da Rocketseat. O projeto permite o cadastro de usuários, criação de categorias e o controle de transações (entradas e saídas).

## 🧱 Stack

- **Backend:** Node.js, TypeScript, Apollo Server, TypeGraphQL, Prisma ORM, SQLite, JWT, bcryptjs
- **Frontend:** React 19, Vite, TypeScript, TailwindCSS, shadcn/ui, Apollo Client, React Router, Zustand

## 📁 Estrutura do repositório

```
ftr-financy/
├── backend/    # API GraphQL (Apollo Server + Prisma)
└── frontend/   # SPA React + Vite
```

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado na sua máquina:

- [Node.js](https://nodejs.org/) **v20** ou superior
- [npm](https://www.npmjs.com/) (já vem junto com o Node)
- [Git](https://git-scm.com/)

## 🚀 Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd ftr-financy
```

---

### 2. Backend

O backend expõe uma API GraphQL em `http://localhost:4000/graphql` e usa SQLite como banco de dados (arquivo local `prisma/dev.db`).

#### 2.1 Instalar dependências

```bash
cd backend
npm install
```

#### 2.2 Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores conforme necessário:

```bash
cp .env.example .env
```

Conteúdo do `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="troque-em-producao"
FRONTEND_URL="http://localhost:5173"
```

#### 2.3 Rodar as migrations e gerar o Prisma Client

```bash
npm run migrate
```

Esse comando cria o banco SQLite, aplica as migrations e gera o Prisma Client.

#### 2.4 (Opcional) Popular o banco com dados de exemplo

```bash
npm run seed
```

#### 2.5 Iniciar o servidor em modo de desenvolvimento

```bash
npm run dev
```

A API estará disponível em: **http://localhost:4000/graphql**

> 💡 Outros scripts disponíveis:
>
> - `npm run build` — compila o TypeScript para `dist/`
> - `npm run start` — executa a build de produção
> - `npm run generate` — regenera o Prisma Client

---

### 3. Frontend

O frontend consome a API GraphQL do backend e roda em `http://localhost:5173`.

> ⚠️ Certifique-se de que o backend está rodando **antes** de iniciar o frontend.

#### 3.1 Instalar dependências

Em um novo terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
```

#### 3.2 Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Conteúdo do `.env`:

```env
VITE_BACKEND_URL=http://localhost:4000/graphql
```

#### 3.3 Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

> 💡 Outros scripts disponíveis:
>
> - `npm run build` — gera a build de produção
> - `npm run preview` — serve a build localmente
> - `npm run lint` — roda o ESLint

---

## 🧪 Fluxo rápido para testar

1. Rode o backend (`cd backend && npm run dev`).
2. Rode o frontend (`cd frontend && npm run dev`).
3. Acesse `http://localhost:5173`.
4. Crie uma conta em **Signup**, faça login e comece a cadastrar categorias e transações. 🎉

---

## 📚 Documentação adicional

- [`backend/REQUISITOS.md`](./backend/REQUISITOS.md) — requisitos do backend
- [`backend/ARCHITECTURE.md`](./backend/ARCHITECTURE.md) — arquitetura do backend
- [`frontend/REQUISITOS.md`](./frontend/REQUISITOS.md) — requisitos do frontend
- [`frontend/ARCHITECTURE.md`](./frontend/ARCHITECTURE.md) — arquitetura do frontend
- [`backend/schema.graphql`](./backend/schema.graphql) — schema GraphQL gerado

---
