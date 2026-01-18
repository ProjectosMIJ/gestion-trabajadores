"use server";

import z from "zod";
import { schemaCode } from "../schemas/schemaCode";
import { ApiResponse } from "@/app/types/types";

export async function createCodeAction(
  values: z.infer<typeof schemaCode>,
  usuario_id: number,
) {
  try {
    const { success, error } = schemaCode.safeParse(values);
    console.log(values);
    if (!success) {
      return {
        success: false,
        message: error.message,
      };
    }
    const payload = { ...values, usuario_id };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}empleados-codigo/`,
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
