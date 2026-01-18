"use server";

import z from "zod";
import { schemaAsignCode } from "../schema/schema-asign-code";
import { ApiResponse } from "@/app/types/types";

export async function AsignCode(
  values: z.infer<typeof schemaAsignCode>,
  user_id: number
) {
  try {
    const payload = {
      usuario_id: user_id,
      employee: values.employee,
    };
    console.log({ ...payload });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}asignar_codigo/${values.code}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload }),
      }
    );
    const getMessage: ApiResponse<never> = await response.json();
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
