import NextAuth from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { DefaultSession } from 'next-auth';

// Add type extension for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession['user'];
  }
}

// Create handler using imported auth options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
