import z from "zod";
import {
  schemaCreateCoordinationDirection,
  schemaCreateDirectionLineDirection,
} from "../schema/schemaCreateDirectionDependency";

export async function createDirectionLine(
  values: z.infer<typeof schemaCreateDirectionLineDirection>,
) {
  const { success } = schemaCreateDirectionLineDirection.safeParse(values);
  if (!success) {
    return {
      success: false,
      message: "Error Al Validar Los Datos",
    };
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}register-direccionLinea/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values }),
    },
  );
  if (response.ok) {
    return {
      success: true,
      message: "Direccion Creada Exitosamente",
    };
  }
  return {
    success: false,
    message: "Error Al Crear La Direccion",
  };
}
export async function createDirectionCordination(
  values: z.infer<typeof schemaCreateCoordinationDirection>,
) {
  const { success } = schemaCreateCoordinationDirection.safeParse(values);
  if (!success) {
    return {
      success: false,
      message: "Error Al Validar Los Datos",
    };
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}register-Coordinacion/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...values }),
    },
  );
  if (response.ok) {
    return {
      success: true,
      message: "Cordinacion Creada Exitosamente",
    };
  }
  return {
    success: false,
    message: "Error Al Crear La Cordinacion",
  };
}
