"use server";

import { ApiResponse } from "@/app/types/types";
import { TypeSchemaUpdateUser } from "../tableUser/updateInfo/schema/schemaUpdateUser";

export default async function updateAction(
  values: TypeSchemaUpdateUser,
  id: number,
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}usuarios/editar/${id}/`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify(values),
      },
    );
    const getResponse: ApiResponse<never> = await response.json();
    if (!(getResponse.status === "error")) {
      return {
        success: false,
        message: getResponse.message,
      };
    }
    return {
      success: true,
      message: getResponse.message,
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
