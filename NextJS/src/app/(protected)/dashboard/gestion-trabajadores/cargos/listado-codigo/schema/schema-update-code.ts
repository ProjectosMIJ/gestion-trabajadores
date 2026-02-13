import z from "zod";

export const schemaUpdateCodeTable = z.object({
  denominacioncargoid: z.number().optional(),
  denominacioncargoespecificoid: z.number().optional(),
  gradoid: z.number().optional(),
  tiponominaid: z.number().optional(),
  Dependencia: z.number().optional(),
  DireccionGeneral: z.number().optional(),
  DireccionLinea: z.number().optional(),
  Coordinacion: z.number().optional(),
});
export type UpdateCodeTable = z.infer<typeof schemaUpdateCodeTable>;
