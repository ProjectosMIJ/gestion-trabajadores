import { z } from "zod";
export const patologiaCronica = z.object({
  value: z.string(),
});
export const schemaCreateFamily = z.object({
  employeecedula: z.string(),
  cedulaFamiliar: z.string().optional(),
  primer_nombre: z.string(),
  segundo_nombre: z.string().optional(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().optional(),
  parentesco: z.number(),
  fechanacimiento: z.date(),
  nivelAcademico: z.number(),
  tallaCamisa: z.number().optional(),
  mismo_ente: z.boolean().default(false),
  tallaPantalon: z.number().optional(),
  tallaZapatos: z.number().optional(),
  GrupoSanguineoid: z.number().optional(),
  sexo: z.number(),
  patologiaCronica: z
    .array(patologiaCronica)
    .transform((v) => v.map((v) => Number.parseInt(v.value)))
    .optional()
    .default([]),
  discapacidad: z.number().optional(),
  estadoCivil: z.number().optional(),
  observaciones: z.string(),
});
