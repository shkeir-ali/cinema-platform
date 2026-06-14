import type { NextAuthConfig } from 'next-auth'

// Edge-safe config — no Node.js-only imports (no bcrypt, no Prisma).
// Used by middleware.ts. The full auth.ts extends this with the Credentials provider.
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as { role?: unknown }).role = token.role
      return session
    },
  },
  providers: [],
}
