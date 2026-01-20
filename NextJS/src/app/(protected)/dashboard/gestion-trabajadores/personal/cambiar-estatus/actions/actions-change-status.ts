"use server";

import z from "zod";
import { schemaStatusChange } from "../schema/schemaChangeStatus";
import { auth } from "#/auth";

export default async function ChangeStatusAction(
  values: z.infer<typeof schemaStatusChange>,
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
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/Estatus/${values.cargo}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estatus_id: values.estatus_id,
          usuario_id: userId,
          motivo: values.motivo,
        }),
      },
    );
    if (response.ok) {
      return {
        success: true,
        message: "Estatus Cambiado Correctamente",
      };
    }
    return {
      success: false,
      message: "Error Al Modificar El Estatus",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
