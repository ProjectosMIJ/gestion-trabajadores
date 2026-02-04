"use server";

import z from "zod";
import { schemaAsignCode } from "../schema/schema-asign-code";
import { auth } from "#/auth";

export async function AsignCode(values: z.infer<typeof schemaAsignCode>) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }
    const userId = Number.parseInt(session.user.id);
    const payload = {
      usuario_id: userId,
      employee: values.employee,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}asignar_codigo/${values.code}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload }),
      },
    );
    if (response.ok) {
      return {
        success: true,
        message: "Codigo Asingnado Exitosamente",
      };
    }
    return {
      success: false,
      message: "Codigo No Asignado",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
