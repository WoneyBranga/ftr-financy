import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CREATE_TRANSACTION,
  UPDATE_TRANSACTION,
} from '@/lib/graphql/mutations/Transaction'
import { LIST_CATEGORIES } from '@/lib/graphql/queries/Category'
import { cn, toDateInputValue } from '@/lib/utils'
import type {
  Category,
  CreateTransactionInput,
  Transaction,
  TransactionType,
  UpdateTransactionInput,
} from '@/types'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  onSaved?: () => void
}

interface CategoriesData {
  categories: Category[]
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSaved,
}: TransactionDialogProps) {
  const isEditing = Boolean(transaction)
  const { data } = useQuery<CategoriesData>(LIST_CATEGORIES, {
    skip: !open,
  })

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [categoryId, setCategoryId] = useState<string>('')

  const [createTransaction, { loading: creating }] = useMutation<
    { createTransaction: Transaction },
    { data: CreateTransactionInput }
  >(CREATE_TRANSACTION)

  const [updateTransaction, { loading: updating }] = useMutation<
    { updateTransaction: Transaction },
    { id: string; data: UpdateTransactionInput }
  >(UPDATE_TRANSACTION)

  useEffect(() => {
    if (!open) return
    if (transaction) {
      setDescription(transaction.description)
      setAmount(String(transaction.amount))
      setType(transaction.type)
      setDate(toDateInputValue(transaction.date))
      setCategoryId(transaction.categoryId)
    } else {
      setDescription('')
      setAmount('')
      setType('expense')
      setDate(toDateInputValue(new Date()))
      setCategoryId('')
    }
  }, [open, transaction])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedAmount = Number(amount.replace(',', '.'))
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    if (!categoryId) {
      toast.error('Selecione uma categoria')
      return
    }

    const payload = {
      description,
      amount: parsedAmount,
      type,
      date: new Date(`${date}T12:00:00`).toISOString(),
      categoryId,
    }

    try {
      if (isEditing && transaction) {
        await updateTransaction({
          variables: { id: transaction.id, data: payload },
        })
        toast.success('Transação atualizada')
      } else {
        await createTransaction({ variables: { data: payload } })
        toast.success('Transação criada')
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      console.log(error)
      toast.error('Não foi possível salvar a transação')
    }
  }

  const categories = data?.categories ?? []
  const loading = creating || updating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar transação' : 'Nova transação'}
          </DialogTitle>
          <DialogDescription>
            Registre entradas e saídas para acompanhar suas finanças.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                  type === 'income'
                    ? 'border-[hsl(var(--income))] bg-[hsl(var(--income)/0.1)] text-[hsl(var(--income))]'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                  type === 'expense'
                    ? 'border-[hsl(var(--expense))] bg-[hsl(var(--expense)/0.1)] text-[hsl(var(--expense))]'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                Saída
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Mercado do mês"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Cadastre categorias primeiro
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
