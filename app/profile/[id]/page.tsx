import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ProfileDisplay from '@/components/user/ProfileDisplay';

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      profile: true,
      projectsAsClient: {
        select: {
          id: true,
          title: true,
          description: true,
          skills: {
            select: { name: true },
          },
        },
      },
      bidsAsFreelancer: {
        where: {
          status: 'ACCEPTED', // Seulement les offres acceptées comme expérience
        },
        select: {
          id: true,
          proposal: true,
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Profil non trouvé</h2>
          <p className="text-gray-600 dark:text-gray-300">Désolé, nous n'avons pas pu charger ce profil.</p>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUserId === params.id;

  // Préparer les données pour le composant client
  const profileData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt,
    profile: user.profile ? {
      id: user.profile.id,
      bio: user.profile.bio,
      location: user.profile.location,
      website: user.profile.website,
      jobTitle: user.profile.jobTitle,
      company: user.profile.company,
      phoneNumber: user.profile.phoneNumber,
      skills: user.profile.skills,
      languages: user.profile.languages,
      awards: user.profile.awards,
      availability: user.profile.availability,
      rating: user.profile.rating,
      hourlyRate: user.profile.hourlyRate,
    } : null,
    projectsAsClient: user.projectsAsClient.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      tags: project.skills.map(skill => skill.name),
    })),
    acceptedBidsAsFreelancer: user.bidsAsFreelancer.map(bid => ({
      id: bid.id,
      proposal: bid.proposal,
      projectTitle: bid.project.title,
    })),
  };

  return <ProfileDisplay profile={profileData} isCurrentUser={isCurrentUser} />;
}
