import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Page, PageHeader } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DELETE_TRANSACTION } from '@/lib/graphql/mutations/Transaction'
import { LIST_TRANSACTIONS } from '@/lib/graphql/queries/Transaction'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { TransactionDialog } from './components/TransactionDialog'
import type { Transaction } from '@/types'

interface TransactionsData {
  transactions: Transaction[]
}

export function TransactionsPage() {
  const { data, loading, refetch } = useQuery<TransactionsData>(LIST_TRANSACTIONS)
  const [deleteTransaction] = useMutation<
    { deleteTransaction: boolean },
    { id: string }
  >(DELETE_TRANSACTION)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const transactions = useMemo(
    () =>
      [...(data?.transactions ?? [])].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [data],
  )

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(transaction: Transaction) {
    setEditing(transaction)
    setDialogOpen(true)
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `Excluir "${transaction.description}"?`,
    )
    if (!confirmed) return
    try {
      await deleteTransaction({ variables: { id: transaction.id } })
      toast.success('Transação excluída')
      await refetch()
    } catch (error) {
      console.log(error)
      toast.error('Não foi possível excluir a transação')
    }
  }

  return (
    <Page>
      <PageHeader
        title="Transações"
        description="Gerencie suas entradas e saídas."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Receipt className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              Nenhuma transação cadastrada ainda.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Criar primeira transação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {transactions.map((transaction) => (
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

                  <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(transaction)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction)}
                        aria-label="Excluir"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        onSaved={() => refetch()}
      />
    </Page>
  )
}
