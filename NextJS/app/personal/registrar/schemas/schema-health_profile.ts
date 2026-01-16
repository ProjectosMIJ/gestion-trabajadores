import { z } from "zod";
export const patologiaCronica = z.object({
  value: z.string(),
});
export const discapacidad = z.object({
  value: z.string(),
});
export const schemaHealthProfile = z.object({
  perfil_salud: z.object({
    grupoSanguineo: z.number(),
    patologiaCronica: z
      .array(patologiaCronica)
      .transform((v) => v.map((v) => Number.parseInt(v.value)))
      .default([]),
    discapacidad: z
      .array(discapacidad)
      .transform((v) => v.map((v) => Number.parseInt(v.value)))
      .default([]),
  }),
});
