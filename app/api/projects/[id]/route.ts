import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
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
    });

    if (!project) {
      return new NextResponse(
        JSON.stringify({ error: 'Projet non trouvé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Erreur serveur lors de la récupération du projet' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log(`[PUT /api/projects/${params.id}] Début de la requête`);
  
  try {
    const { userId } = auth();
    console.log('[PUT] User ID:', userId);
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    console.log('[PUT] Données reçues:', JSON.stringify(data, null, 2));
    
    const { title, description, budget, deadline, categoryId, skills } = data;
    
    // Validation des champs requis
    if (!title || !description || budget === undefined || !deadline || !categoryId) {
      const missingFields = [];
      if (!title) missingFields.push('title');
      if (!description) missingFields.push('description');
      if (budget === undefined) missingFields.push('budget');
      if (!deadline) missingFields.push('deadline');
      if (!categoryId) missingFields.push('categoryId');
      
      console.error(`[PUT] Champs manquants: ${missingFields.join(', ')}`);
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Champs manquants',
          missingFields,
          message: 'Tous les champs sont requis' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    console.log(`[PUT] Recherche du projet avec l'ID: ${params.id}`);
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: { 
        client: true,
        category: true,
        skills: true
      },
    });
    
    console.log('[PUT] Projet existant:', JSON.stringify(existingProject, null, 2));

    if (!existingProject) {
      return new NextResponse(
        JSON.stringify({ error: 'Projet non trouvé' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingProject.clientId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé à modifier ce projet' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que la catégorie existe
    console.log(`[PUT] Vérification de la catégorie avec l'ID: ${categoryId}`);
    const category = await prisma.projectCategory.findUnique({
      where: { id: categoryId },
    });
    
    console.log('[PUT] Catégorie trouvée:', category);

    if (!category) {
      return new NextResponse(
        JSON.stringify({ error: 'Catégorie non trouvée' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Mettre à jour le projet
      const project = await tx.project.update({
        where: { id: params.id },
        data: {
          title,
          description,
          budget: parseFloat(budget),
          deadline: new Date(deadline),
          categoryId,
        },
      });

      // Mettre à jour les compétences
      if (Array.isArray(skills)) {
        // Supprimer les anciennes compétences
        await tx.projectSkill.deleteMany({
          where: { projectId: params.id },
        });

        // Ajouter les nouvelles compétences
        if (skills.length > 0) {
          // Créer chaque compétence individuellement avec une gestion des erreurs
          for (const skillName of skills) {
            try {
              await tx.projectSkill.create({
                data: {
                  name: skillName.trim(),
                  projectId: params.id,
                },
              });
            } catch (error) {
              // Ignorer les erreurs de doublons (contrainte unique)
              if (error.code !== 'P2002') {
                throw error;
              }
            }
          }
        }
      }

      // Récupérer le projet mis à jour avec toutes les relations
      return tx.project.findUnique({
        where: { id: params.id },
        include: {
          category: true,
          client: true,
          skills: true,
        },
      });
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    
    // Log plus détaillé pour les erreurs Prisma
    if (error.code) {
      console.error('Code d\'erreur Prisma:', error.code);
      console.error('Métadonnées de l\'erreur:', error.meta);
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue lors de la mise à jour du projet';
      
    return new NextResponse(
      JSON.stringify({ 
        error: 'Erreur lors de la mise à jour du projet',
        message: errorMessage,
        code: error.code,
        meta: error.meta
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
