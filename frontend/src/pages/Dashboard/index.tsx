import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  ArrowRight,
} from 'lucide-react'
import { Page, PageHeader } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LIST_TRANSACTIONS } from '@/lib/graphql/queries/Transaction'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import type { Transaction } from '@/types'

interface TransactionsData {
  transactions: Transaction[]
}

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { data, loading } = useQuery<TransactionsData>(LIST_TRANSACTIONS)

  const transactions = useMemo(() => data?.transactions ?? [], [data])

  const { income, expense, balance } = useMemo(() => {
    const incomeTotal = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expenseTotal = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      income: incomeTotal,
      expense: expenseTotal,
      balance: incomeTotal - expenseTotal,
    }
  }, [transactions])

  const latest = useMemo(
    () =>
      [...transactions]
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        .slice(0, 5),
    [transactions],
  )

  return (
    <Page>
      <PageHeader
        title={`Olá, ${user?.name?.split(' ')[0] ?? 'dev'}`}
        description="Aqui está o resumo das suas finanças."
        actions={
          <Button asChild>
            <Link to="/transacoes">
              Nova transação <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Saldo"
          value={balance}
          icon={<Wallet className="h-5 w-5" />}
          iconClass="bg-accent text-accent-foreground"
          valueClass={
            balance >= 0 ? 'text-[hsl(var(--income))]' : 'text-[hsl(var(--expense))]'
          }
        />
        <SummaryCard
          label="Entradas"
          value={income}
          icon={<ArrowUpCircle className="h-5 w-5" />}
          iconClass="bg-[hsl(var(--income)/0.1)] text-[hsl(var(--income))]"
          valueClass="text-[hsl(var(--income))]"
        />
        <SummaryCard
          label="Saídas"
          value={expense}
          icon={<ArrowDownCircle className="h-5 w-5" />}
          iconClass="bg-[hsl(var(--expense)/0.1)] text-[hsl(var(--expense))]"
          valueClass="text-[hsl(var(--expense))]"
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Últimas transações
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/transacoes">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Carregando...</p>
            ) : latest.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">
                Nenhuma transação cadastrada ainda.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {latest.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          transaction.type === 'income'
                            ? 'bg-[hsl(var(--income)/0.1)] text-[hsl(var(--income))]'
                            : 'bg-[hsl(var(--expense)/0.1)] text-[hsl(var(--expense))]',
                        )}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowUpCircle className="h-5 w-5" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5" />
                        )}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category?.name ?? 'Sem categoria'} ·{' '}
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        transaction.type === 'income'
                          ? 'text-[hsl(var(--income))]'
                          : 'text-[hsl(var(--expense))]',
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </Page>
  )
}

interface SummaryCardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconClass: string
  valueClass?: string
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  valueClass,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-2xl font-bold', valueClass)}>
            {formatCurrency(value)}
          </p>
        </div>
        <span
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full',
            iconClass,
          )}
        >
          {icon}
        </span>
      </CardContent>
    </Card>
  )
}
