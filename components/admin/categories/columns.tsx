'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { EditCategoryDialog } from './edit-category-dialog'
import { DeleteCategoryDialog } from './delete-category-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Category = {
  id: string
  name: string
  description: string | null
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      return (
        <div className="max-w-[300px] truncate">
          {description || <span className="text-muted-foreground">Aucune description</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'icon',
    header: 'Icône',
    cell: ({ row }) => {
      const icon = row.getValue('icon') as string | null
      return icon ? (
        <div className="flex items-center">
          <span className="mr-2">{icon}</span>
          <code className="bg-muted px-2 py-1 rounded text-xs">{icon}</code>
        </div>
      ) : (
        <span className="text-muted-foreground">Aucune icône</span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }: { row: any, table: any }) => (
      <CategoryActions category={row.original as Category} table={table} />
    )
  },
]

function CategoryActions({ category, table }: { category: Category, table: any }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleSuccess = () => {
    // Rafraîchir les données du tableau
    if (table.options.meta?.refetchData) {
      table.options.meta.refetchData()
    }
  }

  return (
    <div className="flex justify-end space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Éditer</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-destructive hover:text-destructive/90"
        onClick={() => setIsDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <EditCategoryDialog
        category={category}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <DeleteCategoryDialog
        category={category}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
