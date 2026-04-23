import { useEffect, useState, type FormEvent } from 'react'
import { useMutation } from '@apollo/client/react'
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
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
} from '@/lib/graphql/mutations/Category'
import { cn } from '@/lib/utils'
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/types'

const COLORS = [
  '#2F7D3B',
  '#C0392B',
  '#E67E22',
  '#2980B9',
  '#8E44AD',
  '#16A085',
  '#D35400',
  '#2C3E50',
]

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSaved?: () => void
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: CategoryDialogProps) {
  const isEditing = Boolean(category)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(COLORS[0])

  const [createCategory, { loading: creating }] = useMutation<
    { createCategory: Category },
    { data: CreateCategoryInput }
  >(CREATE_CATEGORY)

  const [updateCategory, { loading: updating }] = useMutation<
    { updateCategory: Category },
    { id: string; data: UpdateCategoryInput }
  >(UPDATE_CATEGORY)

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '')
      setColor(category?.color ?? COLORS[0])
    }
  }, [open, category])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      if (isEditing && category) {
        await updateCategory({
          variables: { id: category.id, data: { name, color } },
        })
        toast.success('Categoria atualizada')
      } else {
        await createCategory({ variables: { data: { name, color } } })
        toast.success('Categoria criada')
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      console.log(error)
      toast.error('Não foi possível salvar a categoria')
    }
  }

  const loading = creating || updating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoria' : 'Nova categoria'}
          </DialogTitle>
          <DialogDescription>
            Organize suas transações por categorias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Alimentação"
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className={cn(
                    'h-9 w-9 rounded-full border-2 transition-transform',
                    color === value
                      ? 'scale-110 border-foreground'
                      : 'border-transparent',
                  )}
                  style={{ backgroundColor: value }}
                  aria-label={`Selecionar cor ${value}`}
                />
              ))}
            </div>
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
