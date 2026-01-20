import z from "zod";

export const schemaPasivo = z.object({
  estatus_id: z.number(),
  usuario_id: z.number(),
  motivo: z.string(),
  tiponominaid: z.number(),
  codigo_nuevo: z.string(),
  liberar_activos: z.boolean().default(false),
});
