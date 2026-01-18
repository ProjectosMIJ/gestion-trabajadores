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
      usuario_id,
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
      usuario_id,
      antecedentes,
    };
    const payloadFamily = {
      familys,
    };
    console.log("datos empleados", payloadEmployee);
    console.log("datos familiares", payloadFamily);

    // const response = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ ...data, profile: file?.name }),
    // });
  } catch {}
}
