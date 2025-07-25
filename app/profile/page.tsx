'use client';

import { UserProfile } from '@/components/user/user-profile';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      <UserProfile />
    </div>
  );
}