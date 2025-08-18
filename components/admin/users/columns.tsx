'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'FREELANCER' | 'CLIENT';
  image?: string;
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.image && (
          <img
            src={row.original.image}
            alt={row.original.name}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span>{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => {
      const role = row.original.role;
      const variant = role === 'ADMIN' ? 'destructive' : role === 'FREELANCER' ? 'default' : 'secondary';
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const user = row.original;
      const updateUser = table.options.meta?.updateUser;

      const handleRoleChange = async (newRole: string) => {
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          });

          if (!response.ok) throw new Error('Failed to update user role');
          
          toast.success('Rôle mis à jour avec succès');
          if (updateUser) updateUser(user.id, { ...user, role: newRole });
        } catch (error) {
          console.error('Error updating user role:', error);
          toast.error('Erreur lors de la mise à jour du rôle');
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleRoleChange('ADMIN')}>
              Définir comme Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('FREELANCER')}>
              Définir comme Freelancer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange('CLIENT')}>
              Définir comme Client
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                  try {
                    const response = await fetch(`/api/users/${user.id}`, {
                      method: 'DELETE',
                    });

                    if (!response.ok) throw new Error('Failed to delete user');
                    
                    toast.success('Utilisateur supprimé avec succès');
                    if (updateUser) updateUser(user.id, null);
                  } catch (error) {
                    console.error('Error deleting user:', error);
                    toast.error('Erreur lors de la suppression de l\'utilisateur');
                  }
                }
              }}
              className="text-red-600"
            >
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
