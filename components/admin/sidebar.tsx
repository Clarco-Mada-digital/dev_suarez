'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Folder, Tag, BarChart, Activity, FileText, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin',
      icon: LayoutDashboard,
      label: 'Tableau de bord',
    },
    {
      href: '/admin/users',
      icon: Users,
      label: 'Utilisateurs',
    },
    {
      href: '/admin/projects',
      icon: Folder,
      label: 'Projets',
    },
    {
      href: '/admin/skills',
      icon: Tag,
      label: 'Compétences',
    },
    {
      href: '/admin/categories',
      icon: Tag,
      label: 'Catégories',
    },
    {
      href: '/admin/analytics',
      icon: BarChart,
      label: 'Analytiques',
    },
    {
      href: '/admin/activity',
      icon: Activity,
      label: 'Activité récente',
    },
    {
      href: '/admin/settings',
      icon: Settings,
      label: 'Paramètres',
    },
  ];

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <div className="hidden md:flex fixed top-0 left-0 h-full w-64 z-10">
      <div className="flex flex-col w-full h-full border-r border-gray-200 bg-white dark:bg-gray-800 overflow-y-auto py-20">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 flex-shrink-0 h-6 w-6',
                        isActive
                          ? 'text-primary'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={handleSignOut}
            className="flex-shrink-0 w-full group block text-left"
          >
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                  Déconnexion
                </p>
              </div>
              <div className="ml-auto">
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
