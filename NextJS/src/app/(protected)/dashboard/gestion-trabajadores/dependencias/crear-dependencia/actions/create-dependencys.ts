"use server";

import { z } from "zod";
import {
  schemaCreateDependency,
  schemaCreateDirectionAdm,
} from "../schema/schemaCreateDependency";
import {
  ApiResponse,
  Dependency,
  DireccionGeneral,
  DireccionLinea,
} from "@/app/types/types";

export async function CreateDependencyAction(
  values: z.infer<typeof schemaCreateDirectionAdm>,
) {
  try {
    const { success } = schemaCreateDirectionAdm.safeParse(values);
    if (!success) {
      return {
        success: false,
        message: "Error En Los Campos",
      };
    }

    const responseDependency = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}dependencia/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Codigo: values.dependency.Codigo,
          dependencia: values.dependency.dependencia,
        }),
      },
    );

    const getDependency: ApiResponse<Dependency> =
      await responseDependency.json();
    if (
      !values.activeCoordination &&
      !values.activeDirectionLine &&
      !values.activeDirectionGeneral
    ) {
      return {
        success: true,
        message: "Depedendencia Creada Exitosamente",
      };
    }
    if (responseDependency.ok && values.activeDirectionGeneral) {
      console.log(getDependency);
      const responseDirectionGeneral = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}register-direccionGeneral/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Codigo: values.direction_general?.Codigo,
            direccion_general: values.direction_general?.direccion_general,
            dependenciaId: getDependency.data.id,
          }),
        },
      );
      const getDirectionGeneral: ApiResponse<DireccionGeneral> =
        await responseDirectionGeneral.json();
      if (values.activeDirectionGeneral && !values.activeDirectionLine) {
        return {
          success: true,
          message:
            "Dependencias Creada Exitosamente y Dirección General Asiganada Exitosamente",
        };
      }
      if (responseDirectionGeneral.ok && values.direction_line) {
        const responseDirectionLinea = await fetch(
          `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}register-direccionLinea/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Codigo: values.direction_line?.Codigo,
              direccion_linea: values.direction_line?.direccion_linea,
              direccionGeneral: getDirectionGeneral.data.id,
            }),
          },
        );
        const getDirectionLine: ApiResponse<DireccionLinea> =
          await responseDirectionLinea.json();
        if (values.activeDirectionLine && !values.activeCoordination) {
          return {
            success: true,
            message:
              "Dirección General Y Dirección De LineaCreada Exitosamente",
          };
        }
        if (
          responseDirectionLinea.ok &&
          values.activeCoordination &&
          values.activeDirectionLine &&
          values.activeDirectionGeneral
        ) {
          console.log(getDirectionLine);

          await fetch(
            `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}register-Coordinacion/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Codigo: values.coordination?.Codigo,
                coordinacion: values.coordination?.coordinacion,
                direccionLinea: getDirectionLine.data.id,
              }),
            },
          );
          return {
            success: true,
            message: "Direccion De Dependencia Creada Exitosamente",
          };
        }
      }
    }

    return {
      success: false,
      message: "Error Al Crear Direccion",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrio Un Error",
    };
  }
}
