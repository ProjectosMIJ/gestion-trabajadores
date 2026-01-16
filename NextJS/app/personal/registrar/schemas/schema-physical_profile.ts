import { z } from "zod";

export const schemaPhysicalProfile = z.object({
  perfil_fisico: z.object({
    tallaCamisa: z.number(),
    tallaPantalon: z.number(),
    tallaZapatos: z.number(),
  }),
});
