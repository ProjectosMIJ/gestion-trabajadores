import { signInSchema } from "@/lib/zod";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
export interface SessionType {
  cedula: string;
  user_id: string;
  username: string;
  departament: string;
  email: string;
  phone: string;
  status: string;
  direccion_general: {
    id: string;
    nombre: string;
  };
  direccion_linea: {
    id: string;
    nombre: string;
  } | null;
  coordinacion: { id: string; nombre: string } | null;
  dependencia: {
    id: string;
    nombre: string;
  };
}
export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const { data, success } = signInSchema.safeParse(credentials);
        if (!success) {
          throw new Error("Invalid credentials.");
        }
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}accounts/login/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                cedula: data.identification,
                password: data.password,
              }),
            },
          );

          if (!response.ok) {
            throw new Error("Invalid credentials.");
          }

          const userData: SessionType = await response.json();
          return {
            id: userData.user_id,
            name: userData.username,
            role: userData.status,
            department: userData.departament,
            cedula: userData.cedula,
            phone: userData.phone,
            email: userData.email,
            directionGeneral: userData.direccion_general,
            direccionLine: userData.direccion_linea,
            coordination: userData.coordinacion,
            dependency: userData.dependencia,
          };
        } catch {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
