import z from "zod";

export const schemaStatusChange = z.object({
  estatus_id: z.number(),
  motivo: z.string(),
  cargo: z.number(),
});
