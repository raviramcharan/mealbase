import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'text' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: String(user._id), email: user.email };
      }
    })
  ],
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) { if (user) token.uid = (user as any).id; return token; },
    async session({ session, token }) { if (session.user) (session.user as any).id = token.uid as string; return session; }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
export default authOptions;
