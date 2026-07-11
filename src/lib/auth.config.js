/**
 * Edge-safe NextAuth configuration shared between middleware (edge runtime)
 * and the full server config. It must NOT import the DB client or bcrypt,
 * so the providers array is filled in by src/lib/auth.js.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
