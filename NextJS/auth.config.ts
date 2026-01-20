import { signInSchema } from "@/lib/zod";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

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

          const userData = await response.json();
          return {
            id: userData.user_id,
            name: userData.username,
            department: userData.departament,
            cedula: userData.cedula,
            phone: userData.phone,
            email: userData.email,
            role: userData.status,
            id_especialidad_medico: userData.id_especialidad_medico,
          };
        } catch {
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
