import { z } from "zod";
export const schemaBackgroundDate = z.object({
  institucion: z.string(),
  fecha_ingreso: z.date(),
  fecha_egreso: z.date(),
});
export const schemaBackground = z.object({
  antecedentes: z.array(schemaBackgroundDate),
});
