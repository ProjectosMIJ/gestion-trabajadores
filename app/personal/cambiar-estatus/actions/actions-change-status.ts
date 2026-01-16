"use server";

import z from "zod";
import { schemaStatusChange } from "../schema/schemaChangeStatus";

export default async function ChangeStatusAction(
  values: z.infer<typeof schemaStatusChange>,
  user_id: number
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/Estatus/${values.cargo}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estatus_id: values.estatus_id,
          usuario_id: user_id,
          motivo: values.motivo,
        }),
      }
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
