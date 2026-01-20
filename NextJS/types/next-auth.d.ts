import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      image?: string;
      role?: string;
      department?: string;
      cedula: string;
      phone?: string;
      email?: string;
      id_especialidad_medico?: number;
    } & DefaultSession["user"];
  }
  interface User {
    department?: string;
    cedula?: string;
    role?: string;
    phone?: string;
    id_especialidad_medico?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    department?: string;
    cedula?: string;
    id_especialidad_medico?: number;
  }
}
