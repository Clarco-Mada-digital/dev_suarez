import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  console.log('Requête POST reçue sur /api/projects');
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('Accès non autorisé: utilisateur non connecté');
      return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = session.user.id;
    const data = await req.json();
    console.log('Données reçues:', data);
    
    const { title, description, budget, deadline, categoryId, skills } = data;
    
    // Validation des champs requis
    if (!title || !description || !budget || !deadline || !categoryId) {
      console.log('Champs manquants:', { title, description, budget, deadline, categoryId });
      return new NextResponse(
        JSON.stringify({ error: 'Tous les champs sont requis' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur existe, sinon le créer
    console.log(`Vérification de l'utilisateur avec ID: ${userId}`);
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: session.user.name || 'Utilisateur',
        email: session.user.email || 'utilisateur@example.com',
        // Préserver le rôle actuel si disponible (ex: ADMIN), sinon CLIENT par défaut
        role: (session.user.role as string) || 'CLIENT',
      },
    });

    console.log('Utilisateur vérifié/créé:', user);

    // Vérifier que l'utilisateur a le rôle CLIENT ou ADMIN
    if (user.role !== 'CLIENT' && user.role !== 'ADMIN') {
      console.log('Accès non autorisé: rôle utilisateur incorrect', user.role);
      return new NextResponse(JSON.stringify({ error: 'Non autorisé: rôle incorrect' }), {
        status: 403, // Forbidden, as the user is authenticated but not authorized
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Vérifier que la catégorie existe
    console.log('Recherche de la catégorie avec ID:', categoryId);
    const category = await prisma.projectCategory.findUnique({
      where: { id: categoryId },
    });

    console.log('Catégorie trouvée:', category);

    if (!category) {
      console.log('Catégorie non trouvée avec ID:', categoryId);
      // Récupérer toutes les catégories disponibles pour le débogage
      const allCategories = await prisma.projectCategory.findMany();
      console.log('Catégories disponibles:', allCategories);
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Catégorie non trouvée',
          availableCategories: allCategories 
        }), 
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Créer le projet
    // Vérifier que nous avons bien un ID d'utilisateur valide
    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }

    console.log('Tentative de création du projet avec les données:', {
      title,
      description,
      budget: parseFloat(budget),
      deadline: new Date(deadline),
      status: 'OPEN',
      clientId: userId,
      categoryId,
      skills: Array.isArray(skills) ? skills : []
    });

    try {
      const project = await prisma.project.create({
        data: {
          title,
          description,
          budget: parseFloat(budget),
          deadline: new Date(deadline),
          status: 'OPEN',
          client: {
            connect: { id: userId }
          },
          category: {
            connect: { id: categoryId }
          },
          skills: {
            create: Array.isArray(skills) ? skills.map((skill: string) => ({
              name: skill.trim()
            })) : []
          },
        },
        include: {
          client: true,
          category: true,
          skills: true
        }
      });

      console.log('Projet créé avec succès:', project);
      return NextResponse.json({ projectId: project.id });
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      
      // Vérifier si c'est une erreur de clé étrangère
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? (error as any).code
        : undefined;
      if (code === 'P2003') {
        const errorInfo = {
          code,
          meta: (error as any).meta,
          message: 'Erreur de contrainte de clé étrangère',
          details: 'Vérifiez que toutes les références existent (client, catégorie)'
        };
        console.error('Détails de l\'erreur P2003:', errorInfo);
        return new NextResponse(
          JSON.stringify(errorInfo),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      throw error; // Renvoie l'erreur pour qu'elle soit capturée par le bloc catch externe
    }
  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {
      status: 'OPEN',
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        category: true,
        client: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        skills: true,
      },
      orderBy: sort === 'newest' ? { createdAt: 'desc' } : { budget: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}
