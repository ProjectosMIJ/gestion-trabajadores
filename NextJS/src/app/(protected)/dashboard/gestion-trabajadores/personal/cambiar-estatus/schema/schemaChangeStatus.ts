import z from "zod";

export const schemaStatusChange = z.object({
  estatus_id: z.number(),
  motivo: z.number(),
  cargo: z.number(),
});
