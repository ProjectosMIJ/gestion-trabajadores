"use server";

import z from "zod";
import { schemaCode } from "../schemas/schemaCode";
import { auth } from "#/auth";

export async function createCodeAction(values: z.infer<typeof schemaCode>) {
  try {
    const { success, error } = schemaCode.safeParse(values);
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const userId = Number.parseInt(session.user.id);
    if (!success) {
      return {
        success: false,
        message: error.message,
      };
    }
    const payload = { ...values, usuario_id: userId };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}empleados-codigo/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload }),
      },
    );
    if (!response.ok) {
      return {
        success: false,
        message: "Error Al Crear El Codigo",
      };
    }
    return {
      success: true,
      message: "Codigo Registrado Exitosamente",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio un error Inesperado",
    };
  }
}
