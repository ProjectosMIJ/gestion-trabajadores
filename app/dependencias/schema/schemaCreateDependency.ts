import z from "zod";
export const schemaCreateDirectionLine = z.object({
  Codigo: z
    .string()

    .optional(),
  direccion_linea: z
    .string()

    .optional(),
});

export const schemaCreateCoordination = z.object({
  Codigo: z
    .string()

    .optional(),
  coordinacion: z
    .string()

    .optional(),
});

export const schemaCreateDependency = z
  .object({
    Codigo: z.string().min(3, {
      message: "Debe Tener Minimo 3 Caracteres",
    }),
    direccion_general: z.string().min(3, {
      message: "Debe Tener Minimo 3 Caracteres",
    }),

    direction_line: schemaCreateDirectionLine.optional(),
    coordination: schemaCreateCoordination.optional(),
    activeDirectionLine: z.boolean().default(false),
    activeCoordination: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (
      data.activeDirectionLine &&
      (!data.direction_line?.Codigo || !data.direction_line.direccion_linea)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La Direccion De Linea Es Requerida",
        path: ["direction_line.Codigo", "direction_line.direccion_general"],
      });
    }
    if (
      data.activeCoordination &&
      (!data.coordination?.Codigo || !data.coordination.coordinacion)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La Coordinación De Linea Es Requerida",
        path: ["coordination.Codigo", "coordination.coordinacion"],
      });
    }
  });
