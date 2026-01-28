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
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
        token.cedula = user.cedula;
        token.phone = user.phone;
        // Agregamos los objetos complejos al token
        token.directionGeneral = user.directionGeneral;
        token.direccionLine = user.direccionLine;
        token.coordination = user.coordination;
        token.dependency = user.dependency;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.cedula = token.cedula;
        session.user.phone = token.phone;
        session.user.directionGeneral = token.directionGeneral;
        session.user.direccionLine = token.direccionLine;
        session.user.coordination = token.coordination;
        session.user.dependency = token.dependency;
      }
      return session;
    },
  },
});
