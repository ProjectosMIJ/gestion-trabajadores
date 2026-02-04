import z from "zod";

export const schemaCode = z.object({
  codigo: z.string(),
  denominacioncargoid: z.number(),
  denominacioncargoespecificoid: z.number(),
  gradoid: z.number().optional(),
  tiponominaid: z.number(),
  DireccionGeneral: z.number(),
  DireccionLinea: z.number().default(0),
  Coordinacion: z.number().default(0),
});
