import { Metadata } from 'next';
import { AuthRequired } from '@/components/auth/auth-required';
import { UserProfile } from '@/components/user/user-profile';

export const metadata: Metadata = {
  title: 'Mon Profil',
  description: 'Gérez votre profil utilisateur',
};

export default function ProfilePage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>
      <AuthRequired>
        <UserProfile />
      </AuthRequired>
    </div>
  );
}
