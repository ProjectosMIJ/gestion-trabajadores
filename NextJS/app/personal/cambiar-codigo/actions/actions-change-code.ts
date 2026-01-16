"use server";

import z from "zod";
import { schemaChangeCode } from "../schema/schemaChangeCode";

export default async function ChangeCodeActions(
  values: z.infer<typeof schemaChangeCode>,
  user_id: number
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/cargo-movimiento/${values.code_old}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nuevo_cargo_id: values.nuevo_cargo_id,
          usuario_id: user_id,
          motivo: values.motivo,
        }),
      }
    );
    if (response.ok) {
      return {
        success: true,
        message: "Codigo Cambiado Exitosamente",
      };
    }
    return {
      success: false,
      message: "Error Al Cambiar El Codigo",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
