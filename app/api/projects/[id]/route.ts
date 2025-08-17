import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        bids: {
          include: {
            freelancer: true
          }
        },
        skills: true,
        category: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
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
    const session = await auth();
    const userId = session?.user?.id;
    console.log('[PUT] User ID:', userId);
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await req.json();
    console.log('[PUT] Données reçues:', JSON.stringify(data, null, 2));
    
    const { title, description, budget, deadline, categoryId, skills, status, freelancerRating } = data;
    
    // Les mises à jour partielles sont autorisées. Si un champ est manquant, on conservera la valeur existante.

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

    const isAdmin = session?.user?.role === 'ADMIN';
    if (!isAdmin && existingProject.clientId !== userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autorisé à modifier ce projet' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier la catégorie seulement si elle change
    if (categoryId && categoryId !== existingProject.categoryId) {
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
    }

    // Valider le statut si fourni
    const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
    let parsedStatus: (typeof allowedStatuses)[number] | undefined = undefined;
    if (typeof status !== 'undefined') {
      if (typeof status !== 'string' || !allowedStatuses.includes(status as any)) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Statut invalide',
            allowed: allowedStatuses
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      parsedStatus = status as any;
    }

    // Valider note optionnelle si fournie
    let parsedRating: number | undefined = undefined;
    if (typeof freelancerRating !== 'undefined' && freelancerRating !== null) {
      const r = typeof freelancerRating === 'string' ? parseInt(freelancerRating, 10) : freelancerRating;
      if (Number.isNaN(r) || r < 1 || r > 5) {
        return new NextResponse(
          JSON.stringify({ error: 'La note doit être un entier entre 1 et 5' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      parsedRating = r;
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Mettre à jour le projet
      // Fusionner les valeurs
      const mergedTitle = title ?? existingProject.title;
      const mergedDescription = description ?? existingProject.description;
      const mergedBudget = budget === undefined ? existingProject.budget : parseFloat(budget);
      const mergedDeadline = deadline ? new Date(deadline) : existingProject.deadline;
      const mergedCategoryId = categoryId ?? existingProject.categoryId;

      const project = await tx.project.update({
        where: { id: params.id },
        data: {
          title: mergedTitle,
          description: mergedDescription,
          budget: mergedBudget,
          deadline: mergedDeadline,
          categoryId: mergedCategoryId,
          status: parsedStatus ?? existingProject.status,
          // Stocker la note sur le projet si fournie
          freelancerRating: typeof parsedRating === 'number' ? parsedRating : undefined,
        },
      });

      // Si on passe à COMPLETED et qu'un freelance est assigné, incrémenter ses compteurs
      const transitionedToCompleted = existingProject.status !== 'COMPLETED' && (parsedStatus === 'COMPLETED');
      const wasAlreadyCompleted = existingProject.status === 'COMPLETED';
      if (transitionedToCompleted && project.assignedFreelancerId) {
        // Mettre à jour les compteurs du profil du freelance
        const profile = await tx.userProfile.findUnique({ where: { userId: project.assignedFreelancerId } });
        if (profile) {
          const updates: any = { completedProjectsCount: { increment: 1 } };
          if (typeof parsedRating === 'number') {
            // recalcul de la moyenne
            const currentRating = profile.rating ?? 0;
            const currentCount = profile.ratingCount ?? 0;
            const newAvg = ((currentRating * currentCount) + parsedRating) / (currentCount + 1);
            updates.rating = newAvg;
            updates.ratingCount = { increment: 1 };
          }
          await tx.userProfile.update({
            where: { userId: project.assignedFreelancerId },
            data: updates,
          });
        }
      }

      // Si le projet était déjà COMPLETED et qu'on ajoute une note pour la première fois,
      // mettre à jour uniquement la moyenne et le nombre de notes, sans augmenter completedProjectsCount
      if (
        wasAlreadyCompleted &&
        project.assignedFreelancerId &&
        typeof parsedRating === 'number' &&
        (existingProject.freelancerRating === null || typeof existingProject.freelancerRating === 'undefined')
      ) {
        const profile = await tx.userProfile.findUnique({ where: { userId: project.assignedFreelancerId } });
        if (profile) {
          const currentRating = profile.rating ?? 0;
          const currentCount = profile.ratingCount ?? 0;
          const newAvg = ((currentRating * currentCount) + parsedRating) / (currentCount + 1);
          await tx.userProfile.update({
            where: { userId: project.assignedFreelancerId },
            data: {
              rating: newAvg,
              ratingCount: { increment: 1 },
            },
          });
        }
      }

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
              const code =
                typeof error === 'object' && error !== null && 'code' in error
                  ? (error as any).code
                  : undefined;
              if (code !== 'P2002') {
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
          assignedFreelancer: true,
        },
      });
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    
    // Log plus détaillé pour les erreurs Prisma (si disponibles)
    const isPrismaError = typeof error === 'object' && error !== null && 'code' in error;
    if (isPrismaError) {
      console.error("Code d'erreur Prisma:", (error as any).code);
      console.error("Métadonnées de l'erreur:", (error as any).meta);
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erreur inconnue lors de la mise à jour du projet';
      
    return new NextResponse(
      JSON.stringify({ 
        error: 'Erreur lors de la mise à jour du projet',
        message: errorMessage,
        code: isPrismaError ? (error as any).code : undefined,
        meta: isPrismaError ? (error as any).meta : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}