import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { ProjectEditForm } from '@/components/projects/ProjectEditForm';

export default async function ProjectEditPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      skills: true,
    },
  });

  if (!project) notFound();

  const isAdmin = session.user.role === 'ADMIN';
  if (!isAdmin && project.clientId !== session.user.id) {
    redirect('/projects');
  }

  const categories = await prisma.projectCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const initialValues = {
    title: project.title,
    description: project.description,
    budget: project.budget,
    deadline: new Date(project.deadline).toISOString().split('T')[0],
    categoryId: project.categoryId,
    skills: project.skills.map((s) => s.name).join(', '),
    status: project.status,
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Modifier le projet</h1>
        <ProjectEditForm
          projectId={project.id}
          categories={categories}
          initialValues={initialValues}
        />
      </div>
    </div>
  );
}
