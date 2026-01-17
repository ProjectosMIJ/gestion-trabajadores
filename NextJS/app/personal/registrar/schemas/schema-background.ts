import { z } from "zod";
export const schemaBackgroundDate = z.object({
  institucion: z
    .string({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    })
    .min(1),
  fecha_ingreso: z.date({
    message: "Debe Ingresar Informacion Valida",
    required_error: "Este Campo Es Requerido",
  }),
  fecha_egreso: z.date({
    message: "Debe Ingresar Informacion Valida",
    required_error: "Este Campo Es Requerido",
  }),
});
export const schemaBackground = z.object({
  antecedentes: z.array(schemaBackgroundDate).optional(),
});
export type BackgroundType = z.infer<typeof schemaBackground>;
