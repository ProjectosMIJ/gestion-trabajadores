import { z } from "zod";

export const schemaDwelling = z.object({
  datos_vivienda: z.object({
    direccion_exacta: z.string(),
    estado_id: z.number(),
    municipio_id: z.number(),
    parroquia: z.number(),
    condicion_vivienda_id: z.number(),
  }),
});
