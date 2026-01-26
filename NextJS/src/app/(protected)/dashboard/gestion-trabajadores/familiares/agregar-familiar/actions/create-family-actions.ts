"use server";

import z from "zod";
import { schemaFamilyEmployeeOne } from "../schema/schemaCreateFamily";
import { auth } from "#/auth";

export default async function createFamilyActions(
  values: z.infer<typeof schemaFamilyEmployeeOne>,
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Employeefamily/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, usuario_id: session.user.id }),
      },
    );
    if (response.ok) {
      return {
        success: true,
        message: "Familiar Registrado Exitosamente",
      };
    }
    return {
      success: false,
      message: "Error al registrar el familiar",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio un error",
    };
  }
}
