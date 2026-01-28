import { z } from "zod";

export const schemaReportCode = z.object({
  categoria: z.string().optional(),
  agrupar_por: z.string().optional(),
  tipo_reporte: z.string().optional(),
  filtros: z
    .object({
      dependencia_id: z.number().optional(),
      direccion_general_id: z.number().optional(),
      direccion_linea_id: z.number().optional(),
      coordinacion_id: z.number().optional(),
      nomina_id: z.number().optional(),
      grado_id: z.number().optional(),
      cargo_id: z.number().optional(),
      cargo_especifico_id: z.number().optional(),
      estatus_id: z.number().optional(),
    })
    .optional(),
});
export type SchemaReportCodeType = z.infer<typeof schemaReportCode>;
