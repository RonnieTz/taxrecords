import { getServerSession } from 'next-auth/next';
import { authOptions } from './lib/authConfig';

export function auth() {
  return getServerSession(authOptions);
}
