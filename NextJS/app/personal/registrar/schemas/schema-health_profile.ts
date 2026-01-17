import { z } from "zod";
export const patologiaCronica = z.object({
  value: z.string({
    message: "Debe Ingresar Informacion Valida",
    required_error: "Este Campo Es Requerido",
  }),
});
export const discapacidad = z.object({
  value: z.string({
    message: "Debe Ingresar Informacion Valida",
    required_error: "Este Campo Es Requerido",
  }),
});
export const schemaHealthProfile = z.object({
  perfil_salud: z.object({
    grupoSanguineo: z.number({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    }),
    patologiaCronica: z.array(z.number()).optional(),

    discapacidad: z.array(z.number()).optional(),
  }),
});
export type HealthType = z.infer<typeof schemaHealthProfile>;
