"use server";
import z from "zod";
import { BasicInfoType } from "../schemas/schema-basic-info";
import { AcademyType } from "../schemas/schema-academic_training";
import { BackgroundType } from "../schemas/schema-background";
import { HealthType } from "../schemas/schema-health_profile";
import { PhysicalProfileType } from "../schemas/schema-physical_profile";
import { DwellingType } from "../schemas/schema-dwelling";
import { Values } from "@formity/react";
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
      file,
      formacion_academica,
      n_contrato,
      nombres,
      perfil_fisico,
      perfil_salud,
      sexoid,
      usuario_id: 5,
      antecedentes,
    };
    const payloadFamily = {
      familys: familys?.map((familiar) => ({
        ...familiar,
        usuario_id: 5,
        employeecedula: cedulaidentidad, // Aquí insertas la cédula
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
          profile: file?.name,
          usuario_id: 5,
        }),
      },
    );
    if (response.ok) {
      const response = await fetch(
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
