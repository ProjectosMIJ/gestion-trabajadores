"use server";

import { auth } from "#/auth";
import { SchemaUpdateCode } from "../schema/schema-update-code";

export async function updateCode(values: SchemaUpdateCode) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }
    const { code, ...valuesNotCode } = values;
    const userId = Number.parseInt(session.user.id);
    const payload = {
      usuario_id: userId,
      ...valuesNotCode,
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}codigos/${code}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload }),
      },
    );
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
