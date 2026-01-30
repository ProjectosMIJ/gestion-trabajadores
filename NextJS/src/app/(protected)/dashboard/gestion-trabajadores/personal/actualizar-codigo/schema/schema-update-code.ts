import z from "zod";

export const schemaUpdateCode = z.object({
  code: z.number(),
  denominacioncargoid: z.number(),
  denominacioncargoespecificoid: z.number(),
  gradoid: z.number(),
  tiponominaid: z.number(),
  DireccionGeneral: z.number(),
  DireccionLinea: z.number(),
  Coordinacion: z.number(),
});
export type SchemaUpdateCode = z.infer<typeof schemaUpdateCode>;
