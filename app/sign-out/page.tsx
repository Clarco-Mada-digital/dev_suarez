import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function SignOutPage() {
  await auth.signOut();
  redirect('/sign-in');
}
