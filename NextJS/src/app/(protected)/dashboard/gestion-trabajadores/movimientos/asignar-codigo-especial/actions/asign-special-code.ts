"use server";
import { z } from "zod";
import { schemaCodeEspecial } from "../schema/schemaCodeEspecial";
import { auth } from "#/auth";
export async function AsignSpecialCode(
  values: z.infer<typeof schemaCodeEspecial>,
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const userId = Number.parseInt(session.user.id);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}asignacion_CodigoEspecia/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, usuario_id: userId }),
      },
    );
    if (response.ok) {
      return {
        success: true,
        message: "Codigo Especial Asignado",
      };
    }
    return {
      success: false,
      message: "Ocurrio Un Error Al Asignar El Codigo Especial",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
