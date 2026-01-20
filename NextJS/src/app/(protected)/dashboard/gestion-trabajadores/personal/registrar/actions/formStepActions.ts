"use server";
import { auth } from "#/auth";
import { BasicInfoType } from "../schemas/schema-basic-info";
import { AcademyType } from "../schemas/schema-academic_training";
import { BackgroundType } from "../schemas/schema-background";
import { HealthType } from "../schemas/schema-health_profile";
import { PhysicalProfileType } from "../schemas/schema-physical_profile";
import { DwellingType } from "../schemas/schema-dwelling";
import { FamilyEmployeeType } from "../schemas/schema-family_employee";
export async function registerEmployeeSteps(
  data: BasicInfoType &
    AcademyType &
    BackgroundType &
    HealthType &
    PhysicalProfileType &
    DwellingType &
    FamilyEmployeeType,
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
    const {
      apellidos,
      cedulaidentidad,
      datos_vivienda,
      estadoCivil,
      fecha_nacimiento,
      fechaingresoorganismo,
      file,
      formacion_academica,
      n_contrato,
      nombres,
      perfil_fisico,
      perfil_salud,
      sexoid,
      antecedentes,
      familys,
    } = data;
    const payloadEmployee = {
      apellidos,
      cedulaidentidad,
      datos_vivienda,
      estadoCivil,
      fecha_nacimiento,
      fechaingresoorganismo,
      profile: file.name,
      formacion_academica,
      n_contrato,
      nombres,
      perfil_fisico,
      perfil_salud,
      sexoid,
      usuario_id: userId,
      antecedentes,
    };
    const payloadFamily = {
      familys: familys?.map((familiar) => ({
        ...familiar,
        usuario_id: userId,
        employeecedula: cedulaidentidad,
      })),
    };
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}employees_register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payloadEmployee,
        }),
      },
    );
    if (response.ok) {
      await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Employeefamily/masivo/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadFamily.familys),
        },
      );
      return {
        success: true,
        message: "Empleado Registrado Exitosamente",
      };
    }
    return {
      success: false,
      message: "Ocurrio Un Error Al Registrar El Empleado",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error ",
    };
  }
}
