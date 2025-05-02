import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        await dbConnect();

        const user = await User.findOne({ username: credentials.username });
        if (!user) return null;
        console.log(user);

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (isValid) {
          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
