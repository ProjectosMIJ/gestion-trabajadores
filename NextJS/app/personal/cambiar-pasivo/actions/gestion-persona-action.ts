import z from "zod";
import { schemaPasivo } from "../schema/schemaPasivo";

export default async function GestionAction(
  values: z.infer<typeof schemaPasivo>,
  user_id: number,
  employee: string
) {
  try {
    console.log(values);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/egreso/${employee}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, usuario_id: user_id }),
      }
    );
    if (response.ok) {
      return {
        success: true,
        message: "Movimiento Realizado Exitosamente",
      };
    }
    return {
      success: false,
      message: "Error Al Realizar El Movimiento",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
