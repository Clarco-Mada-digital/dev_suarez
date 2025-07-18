import { redirect } from 'next/navigation';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { ProjectForm } from '@/components/projects/ProjectForm';
import UnauthorizedMessage from '@/components/UnauthorizedMessage';

export default async function NewProjectPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  if (!userId) {
    return <UnauthorizedMessage message="Vous devez être connecté pour publier un projet." showLoginButton={true} />;
  }

  if (userRole !== 'CLIENT') {
    return <UnauthorizedMessage message="Seuls les clients peuvent publier des projets." />;
  }

  const categories = await prisma.projectCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return <ProjectForm categories={categories} />;
}
