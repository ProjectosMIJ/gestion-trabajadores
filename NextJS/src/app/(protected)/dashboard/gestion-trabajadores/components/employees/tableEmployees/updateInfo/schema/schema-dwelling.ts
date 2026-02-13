import { z } from "zod";

export const schemaDwellingUpdate = z.object({
  datos_vivienda: z.object({
    direccion_exacta: z
      .string({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    estado_id: z
      .number({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    municipio_id: z
      .number({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    parroquia: z
      .number({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
    condicion_vivienda_id: z
      .number({
        message: "Debe Ingresar Información Valida",
      })
      .optional(),
  }),
});
export type DwellingUpdateType = z.infer<typeof schemaDwellingUpdate>;
