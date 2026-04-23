import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Page, PageHeader } from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DELETE_CATEGORY } from '@/lib/graphql/mutations/Category'
import { LIST_CATEGORIES } from '@/lib/graphql/queries/Category'
import { CategoryDialog } from './components/CategoryDialog'
import type { Category } from '@/types'

interface CategoriesData {
  categories: Category[]
}

export function CategoriesPage() {
  const { data, loading, refetch } = useQuery<CategoriesData>(LIST_CATEGORIES)
  const [deleteCategory] = useMutation<{ deleteCategory: boolean }, { id: string }>(
    DELETE_CATEGORY,
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    setDialogOpen(true)
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${category.name}"?`,
    )
    if (!confirmed) return
    try {
      await deleteCategory({ variables: { id: category.id } })
      toast.success('Categoria excluída')
      await refetch()
    } catch (error) {
      console.log(error)
      toast.error('Não foi possível excluir a categoria')
    }
  }

  const categories = data?.categories ?? []

  return (
    <Page>
      <PageHeader
        title="Categorias"
        description="Organize suas transações com categorias personalizadas."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova categoria
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Tag className="h-6 w-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              Você ainda não tem categorias cadastradas.
            </p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Criar primeira categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-full"
                    style={{
                      backgroundColor: category.color ?? 'hsl(var(--primary))',
                    }}
                    aria-hidden
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.color ?? 'sem cor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(category)}
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category)}
                    aria-label="Excluir"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        onSaved={() => refetch()}
      />
    </Page>
  )
}
