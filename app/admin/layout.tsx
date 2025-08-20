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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-64">
          <AdminNavbar user={session.user} />
          <main className="flex-1 p-6 mt-16">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
