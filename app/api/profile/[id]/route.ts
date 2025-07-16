import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

// Désactiver le cache pour le débogage
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Types pour les données de réponse
interface ProjectData {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  categoryId: string;
  skills: { name: string }[];
  bids: any[];
}

interface BidData {
  id: string;
  amount: number;
  proposal: string;
  status: string;
  projectId: string;
  freelancerId: string;
  project: {
    id: string;
    title: string;
  };
}

interface UserData {
  id: string;
  clerkId: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Début de la requête GET pour le profil ID:', params.id);
  
  try {
    const session = await auth.getSession();
    
    if (!session?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Pas de vérification d'authentification pour la consultation du profil
    // Les profils sont accessibles publiquement
    console.log('Accès public au profil demandé');

    // 1. Récupérer l'utilisateur de base
    console.log('1. Récupération de l\'utilisateur avec ID:', params.id);
    
    let userData: UserData | null = null;
    
    try {
      const users = await prisma.$queryRaw`
        SELECT * FROM users WHERE id = ${params.id};
      ` as UserData[];
      
      if (users.length > 0) {
        userData = users[0];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Créer un profil vide s'il n'existe pas
    let user = await prisma.user.findUnique({
      where: { id: userData.id },
      include: {
        profile: true
      }
    });

    if (!user) {
      const newProfile = await prisma.userProfile.create({
        data: {
          userId: userData.id,
          bio: '',
          location: '',
          website: '',
          jobTitle: '',
          company: '',
          phoneNumber: ''
        }
      });
      
      return NextResponse.json(newProfile);
    }

    let projects: ProjectData[] = [];
    let bids: BidData[] = [];
    
    try {
      // 2. Récupérer les projets de l'utilisateur
      console.log('2. Récupération des projets pour l\'utilisateur:', user.id);
      projects = await prisma.$queryRaw`
        SELECT p.*, 
               json_group_array(ps.name) as skillNames
        FROM Project p
        LEFT JOIN ProjectSkill ps ON p.id = ps.projectId
        WHERE p.clientId = ${user.id}
        GROUP BY p.id;
      ` as any;
      
      console.log(`   ${projects.length} projets trouvés`);
    } catch (projectsError) {
      console.error('Erreur lors de la récupération des projets:', projectsError);
      // On continue même en cas d'erreur
    }
    
    try {
      // 3. Récupérer les offres de l'utilisateur
      console.log('3. Récupération des offres pour l\'utilisateur:', user.id);
      bids = await prisma.$queryRaw`
        SELECT b.*, 
               json_object('id', p.id, 'title', p.title) as project
        FROM ProjectBid b
        JOIN Project p ON b.projectId = p.id
        WHERE b.freelancerId = ${userData.id};
      ` as any;
      
      console.log(`   ${bids.length} offres trouvées`);
    } catch (bidsError) {
      console.error('Erreur lors de la récupération des offres:', bidsError);
      // On continue même en cas d'erreur
    }

    // Formater les données pour le frontend
    const profileData = {
      id: userData.id,
      name: userData.name || 'Utilisateur sans nom',
      email: userData.email,
      role: userData.role || 'Non spécifié',
      location: 'Non spécifiée', // À mettre à jour si vous ajoutez un champ location
      bio: 'Aucune biographie disponible', // À mettre à jour si vous ajoutez un champ bio
      skills: [], // À mettre à jour si vous avez une table de compétences
      experience: [], // À mettre à jour si vous avez une table d'expériences
      projects: projects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description || 'Aucune description disponible',
        tags: project.skillNames ? JSON.parse(project.skillNames) : []
      })),
      bids: bids.map(bid => ({
        id: bid.id,
        amount: bid.amount,
        status: bid.status,
        project: bid.project ? {
          id: JSON.parse(bid.project as any).id,
          title: JSON.parse(bid.project as any).title
        } : null
      })).filter(bid => bid.project !== null) // Filtrer les offres sans projet
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('[PROFILE_GET]', error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
