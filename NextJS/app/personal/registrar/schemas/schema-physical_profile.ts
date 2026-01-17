import { z } from "zod";

export const schemaPhysicalProfile = z.object({
  perfil_fisico: z.object({
    tallaCamisa: z
      .number({
        message: "Debe Ingresar Informacion Valida",
        required_error: "Este Campo Es Requerido",
      })
      .min(1),
    tallaPantalon: z
      .number({
        message: "Debe Ingresar Informacion Valida",
        required_error: "Este Campo Es Requerido",
      })
      .min(1),
    tallaZapatos: z
      .number({
        message: "Debe Ingresar Informacion Valida",
        required_error: "Este Campo Es Requerido",
      })
      .min(1),
  }),
});
export type PhysicalProfileType = z.infer<typeof schemaPhysicalProfile>;
