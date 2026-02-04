import { z } from "zod";

export const schemaAcademyUpdate = z.object({
  formacion_academica: z.object({
    nivel_Academico_id: z
      .number({
        message: "Debe Seleccionar un Nivel Academico",
      })
      .optional(),
    carrera_id: z
      .number({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    mencion_id: z
      .number({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    capacitacion: z
      .string({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    institucion: z
      .string({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
  }),
});
export type AcademyUpdateUpdateType = z.infer<typeof schemaAcademyUpdate>;
