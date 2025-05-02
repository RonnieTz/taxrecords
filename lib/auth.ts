import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return session.user;
}

export async function getUserId() {
  const user = await getCurrentUser();

  // Use id from the session when available (preferred)
  if (user.id) {
    return user.id;
  }

  // Fall back to email if id is not available
  if (!user.email) {
    throw new Error('User has no ID or email');
  }

  return user.email;
}
