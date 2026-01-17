import { z } from "zod";

export const schemaDwelling = z.object({
  datos_vivienda: z.object({
    direccion_exacta: z.string({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    }),
    estado_id: z.number({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    }),
    municipio_id: z.number({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    }),
    parroquia: z.number({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    }),
    condicion_vivienda_id: z
      .number({
        message: "Debe Ingresar Informacion Valida",
        required_error: "Este Campo Es Requerido",
      })
      .optional(),
  }),
});
export type DwellingType = z.infer<typeof schemaDwelling>;
