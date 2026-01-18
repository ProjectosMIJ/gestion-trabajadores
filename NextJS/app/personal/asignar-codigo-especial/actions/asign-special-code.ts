"use server";
import { z } from "zod";
import { schemaCodeEspecial } from "../schema/schemaCodeEspecial";
export async function AsignSpecialCode(
  values: z.infer<typeof schemaCodeEspecial>,
  user_id: number
) {
  console.log({ ...values, user_id });
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}asignacion_CodigoEspecia/`,
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
