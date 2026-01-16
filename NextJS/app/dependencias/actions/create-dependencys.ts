"use server";

import { z } from "zod";
import { schemaCreateDependency } from "../schema/schemaCreateDependency";
import { ApiResponse } from "@/app/types/types";

export async function CreateDependencyAction(
  values: z.infer<typeof schemaCreateDependency>
) {
  try {
    console.log(values);
    const { success, error } = schemaCreateDependency.safeParse(values);
    if (!success) {
      return {
        success: false,
        message: "Error En Los Campos",
      };
    }
    const responseDirectionGeneral = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}register-direccionGeneral/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Codigo: values.Codigo,
          direccion_general: values.direccion_general,
        }),
      }
    );
    const getDirectionGeneral: ApiResponse<{
      id: number;
      Codigo: string;
      direcction_general: string;
    }> = await responseDirectionGeneral.json();
    if (values.activeCoordination) {
      const responseDirectionLinea = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}register-direccionLinea/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Codigo: values.direction_line?.Codigo,
            direccion_linea: values.direction_line?.direccion_linea,
            direccionGeneral: getDirectionGeneral.data.id,
          }),
        }
      );
      const getDirectionLine: ApiResponse<{
        id: number;
        Codigo: string;
        direccion_linea: string;
      }> = await responseDirectionLinea.json();
      if (values.activeCoordination) {
        await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_API_URL}register-Coordinacion/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Codigo: values.coordination?.Codigo,
              direccion_linea: values.coordination?.coordinacion,
              direccionLinea: getDirectionLine.data.id,
            }),
          }
        );
      }
    }
    return {
      success: true,
      message: "Creado Exitosamente",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
