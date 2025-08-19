import { Sidebar } from '@/components/admin/sidebar';
import { AdminNavbar } from '@/components/admin/navbar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 pl-64 w-full">
        <AdminNavbar user={session.user} />
        <main className="flex-1 overflow-y-auto mt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
