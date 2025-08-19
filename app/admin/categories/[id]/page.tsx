'use client'

import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  }),
  description: z.string().optional(),
  icon: z.string().optional(),
})

type Category = {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export default function EditCategoryPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<Category | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  })

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/admin/categories/${id}`)
        if (!response.ok) throw new Error('Failed to fetch category')
        const data = await response.json()
        setCategory(data)
        form.reset({
          name: data.name,
          description: data.description || '',
          icon: data.icon || '',
        })
      } catch (error) {
        console.error('Error fetching category:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la catégorie',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchCategory()
    }
  }, [id, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Une erreur est survenue lors de la mise à jour de la catégorie")
      }

      toast({
        title: 'Succès',
        description: 'La catégorie a été mise à jour avec succès.',
      })

      router.push('/admin/categories')
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour de la catégorie.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Catégorie non trouvée</h2>
          <p className="text-muted-foreground mt-2">
            La catégorie que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button className="mt-4" onClick={() => router.push('/admin/categories')}>
            Retour à la liste des catégories
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Modifier la catégorie</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Modifier les détails de la catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Développement web" {...field} />
                    </FormControl>
                    <FormDescription>
                      Le nom de la catégorie tel qu'il apparaîtra sur le site.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez cette catégorie..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Une brève description de la catégorie (optionnel).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icône</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: code" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nom de l'icône (optionnel) - Utilisez les noms d'icônes de Lucide.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/categories')}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Mettre à jour
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
