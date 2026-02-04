import { z } from "zod";

export const schemaDwellingUpdate = z.object({
  datos_vivienda: z.object({
    direccion_exacta: z
      .string({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    estado_id: z
      .number({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    municipio_id: z
      .number({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    parroquia: z
      .number({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
    condicion_vivienda_id: z
      .number({
        message: "Debe Ingresar Informacion Valida",
      })
      .optional(),
  }),
});
export type DwellingUpdateType = z.infer<typeof schemaDwellingUpdate>;
