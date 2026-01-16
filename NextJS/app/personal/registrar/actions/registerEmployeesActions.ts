"use server";
import z from "zod";
import { schemaRac } from "../schemas/schemaRac";
import { ApiResponse } from "@/app/types/types";

export async function registerEmployee(
  values: z.infer<typeof schemaRac>,
  user_id: string
) {
  try {
    const { success, error } = schemaRac.safeParse(values);
    const {
      file,
      fecha_nacimiento,
      fechaingresoapn,
      fechaingresoorganismo,
      ...data
    } = values;
    const payload = {
      ...data,
      fecha_nacimiento: fecha_nacimiento.toISOString(),
      fechaingresoapn: fechaingresoapn.toISOString(),
      fechaingresoorganismo: fechaingresoorganismo.toISOString(),
      profile: file?.name,
    };
    // if (!success) {
    //   return {
    //     success: false,
    //     message: error.errors.map((v) => v.path),
    //   };
    // }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}employees_register/`,

      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, usuario_id: user_id }),
      }
    );
    const message: ApiResponse<string> = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: message.message,
      };
    }
    const formData = new FormData();
    formData.append("file", values.file!);
    const responseFile = await fetch(
      `${process.env.NEXT_PUBLIC_NEST_API_URL}file-save/upload/profile/${values.cedulaidentidad}`,

      {
        method: "POST",
        body: formData,
      }
    );
    return {
      success: true,
      message: message.message,
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio un error",
    };
  }
}
