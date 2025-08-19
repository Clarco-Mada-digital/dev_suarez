import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/categories/[id] - Récupérer une catégorie par son ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const category = await prisma.projectCategory.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!category) {
      return new NextResponse('Catégorie non trouvée', { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}

// PUT /api/admin/categories/[id] - Mettre à jour une catégorie
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon } = body

    if (!name) {
      return new NextResponse('Le nom est requis', { status: 400 })
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.projectCategory.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return new NextResponse('Catégorie non trouvée', { status: 404 })
    }

    // Vérifier si le nom est déjà utilisé par une autre catégorie
    const nameInUse = await prisma.projectCategory.findFirst({
      where: {
        name,
        NOT: {
          id: params.id,
        },
      },
    })

    if (nameInUse) {
      return new NextResponse('Une catégorie avec ce nom existe déjà', { status: 400 })
    }

    const updatedCategory = await prisma.projectCategory.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description: description || null,
        icon: icon || null,
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}

// DELETE /api/admin/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Non autorisé', { status: 403 })
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.projectCategory.findUnique({
      where: { id: params.id },
      include: {
        projects: true,
      },
    })

    if (!existingCategory) {
      return new NextResponse('Catégorie non trouvée', { status: 404 })
    }

    // Vérifier si la catégorie est utilisée par des projets
    if (existingCategory.projects.length > 0) {
      return new NextResponse(
        'Impossible de supprimer cette catégorie car elle est utilisée par un ou plusieurs projets',
        { status: 400 }
      )
    }

    await prisma.projectCategory.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
