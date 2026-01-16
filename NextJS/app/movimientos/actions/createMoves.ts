"use server";

import z from "zod";
import { schemaMove } from "../schemas/schemaMoves";
import { ApiResponse } from "@/app/types/types";

export async function createMoveActions(
  values: z.infer<typeof schemaMove>,
  id: string,
  config: boolean
) {
  try {
    const { success, error } = schemaMove.safeParse(values);
    const { codigo_actual, isCode, ...data } = values;
    if (!success) {
      return {
        success: false,
        message: error.message,
      };
    }
    if (isCode && !config) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/cargo-movimiento/${codigo_actual}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const message: ApiResponse<string> = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: message.message,
        };
      }
      return {
        success: true,
        message: message.message,
      };
    } else if (config) {
      const { modificado_por_id, estatus, observaciones } = values;
      const payload = {
        modificado_por_id,
        estatus,
        observaciones,
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/Estatus/${codigo_actual}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const message: ApiResponse<string> = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: message.message,
        };
      }
      return {
        success: true,
        message: message.message,
      };
    } else {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/egreso/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
      const message: ApiResponse<string> = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: message.message,
        };
      }
      return {
        success: true,
        message: message.message,
      };
    }
  } catch (error) {
    console.error("Error en createMoveActions:", error);

    // Si quieres más detalles
    if (error instanceof Error) {
      console.error("Mensaje:", error.message);
      console.error("Stack:", error.stack);
    }

    return {
      success: false,
      message: "Ocurrio un error Inesperado",
    };
  }
}
