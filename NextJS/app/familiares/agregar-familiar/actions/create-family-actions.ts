"use server";

import z from "zod";
import { schemaCreateFamily } from "../schema/schemaCreateFamily";

export default async function createFamilyActions(
  values: z.infer<typeof schemaCreateFamily>,
  user_id: number
) {
  try {
    console.log({ ...values, usuario_id: user_id });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}FamilyRac/create-empleadoFamiliar/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, usuario_id: user_id }),
      }
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
