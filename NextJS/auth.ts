import NextAuth from "next-auth";
import authConfig from "#/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },
  trustHost: true,
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.department = user.department;
        token.cedula = user.cedula;
        token.phone = user.phone;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id as string;
        session.user.department = token.department;
        session.user.cedula = token.cedula as string;
        session.user.phone = token.phone as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});
