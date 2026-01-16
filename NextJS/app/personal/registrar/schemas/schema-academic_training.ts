import { z } from "zod";

export const schemaAcademy = z.object({
  perfil_fisico: z.object({
    nivel_Academico_id: z.number(),
    carrera_id: z.number(),
    mencion_id: z.number(),
    capacitacion: z.string(),
    institucion: z.string(),
  }),
});
