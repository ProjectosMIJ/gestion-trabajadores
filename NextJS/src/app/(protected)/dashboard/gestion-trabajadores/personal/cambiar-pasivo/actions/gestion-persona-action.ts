import z from "zod";
import { schemaPasivo } from "../schema/schemaPasivo";
import { auth } from "#/auth";

export default async function GestionAction(
  values: z.infer<typeof schemaPasivo>,

  employee: string,
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return {
        success: false,
        message: "No tienes permiso para realizar esta acción. Inicia sesión.",
      };
    }

    const userId = Number.parseInt(session.user.id);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/egreso/${employee}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, usuario_id: userId }),
      },
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
