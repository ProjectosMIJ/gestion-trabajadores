import z from "zod";
export const schemaMove = z.object({
  codigo_nuevo: z.string(),
  observaciones: z.string(),
  codigo_actual: z.string(),
  modificado_por_id: z.number(),
  isCode: z.boolean().default(false),
  estatus: z.number().default(4),
  new_denominacioncargoespecificoid: z.number().default(0),
  new_denominacioncargoid: z.number().default(0),
  new_tiponominaid: z.number().default(0),
});
