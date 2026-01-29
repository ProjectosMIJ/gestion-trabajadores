"use server";

import { z } from "zod";
import { schemaCreateDependency } from "../schema/schemaCreateDependency";
import {
  ApiResponse,
  DireccionGeneral,
  DireccionLinea,
} from "@/app/types/types";

export async function CreateDependencyAction(
  values: z.infer<typeof schemaCreateDependency>,
) {
  try {
    const { success } = schemaCreateDependency.safeParse(values);
    if (!success) {
      return {
        success: false,
        message: "Error En Los Campos",
      };
    }
    const responseDirectionGeneral = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}register-direccionGeneral/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Codigo: values.Codigo,
          direccion_general: values.direccion_general,
        }),
      },
    );
    if (!values.activeCoordination && !values.activeDirectionLine) {
      return {
        success: true,
        message: "Direccion General Creada Exitosamente",
      };
    }
    const getDirectionGeneral: ApiResponse<DireccionGeneral> =
      await responseDirectionGeneral.json();
    if (responseDirectionGeneral.ok) {
      if (values.direction_line) {
        const responseDirectionLinea = await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}register-direccionLinea/`,
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
          },
        );
        const getDirectionLine: ApiResponse<DireccionLinea> =
          await responseDirectionLinea.json();
        if (values.activeDirectionLine && !values.activeCoordination) {
          return {
            success: true,
            message:
              "Direccion General Y Direccion De Linea Creada Exitosamente",
          };
        }
        if (responseDirectionLinea.ok) {
          if (values.activeCoordination && values.activeDirectionLine) {
            await fetch(
              `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}register-Coordinacion/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  Codigo: values.coordination?.Codigo,
                  coordinacion: values.coordination?.coordinacion,
                  direccionLinea: getDirectionLine.data.id,
                }),
              },
            );
            return {
              success: true,
              message: "Direccion De Dependencia Creada Exitosamente",
            };
          }
        }
      }
    }

    return {
      success: false,
      message: "Error Al Crear Direccion",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
