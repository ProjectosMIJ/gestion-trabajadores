"use server";

import { AcademyType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/registrar/schemas/schema-academic_training";
import { BackgroundType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/registrar/schemas/schema-background";
import { DwellingType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/registrar/schemas/schema-dwelling";
import { HealthType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/registrar/schemas/schema-health_profile";
import { PhysicalProfileType } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/registrar/schemas/schema-physical_profile";
import { BasicInfoUpdateType } from "../schema/schemaEmployeeUpdate";
import { auth } from "#/auth";

export default async function updateInfoEmployee(
  data:
    | PhysicalProfileType
    | BackgroundType
    | HealthType
    | DwellingType
    | AcademyType
    | BasicInfoUpdateType,
  idEmployee: string,
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
    console.log({ ...data, usuario_id: userId, idEmployee });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}Employee/${idEmployee}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, usuario_id: userId }),
      },
    );
    if (response.ok) {
      return {
        success: true,
        message: "Informacion Actualizada Exitosamente",
      };
    }
    return {
      success: false,
      message: "Error Al Actualizar la informacion",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
