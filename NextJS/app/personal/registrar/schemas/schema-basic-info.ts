import { z } from "zod";

export const schemaBasicInfo = z.object({
  usuario_id: z.number(),
  cedulaidentidad: z
    .string({
      message: "Debe Ingresar Numeros",
      required_error: "Cedula De Identidad Es Requerido",
    })
    .min(7, { message: "Debe Ingresar Al Menos 7 Digitos" })
    .max(12, { message: "Debe Maximo 12 Digitos" }),
  nombres: z
    .string({
      message: "Debe Ingresar Letras",
      required_error: "El Nombre Completo Es Requerido",
    })
    .min(3, { message: "Debe Ingresar Al Menos 3 Letras" })
    .max(30, {
      message: "Debe Ingresar Maximo 30 Letras",
    }),
  apellidos: z
    .string({
      message: "Debe Ingresar Letras",
      required_error: "El Apellido Completo Es Requerido",
    })
    .min(3, { message: "Debe Ingresar Al Menos 3 Letras" })
    .max(30, {
      message: "Debe Ingresar Maximo 30 Letras",
    }),
  file: z.instanceof(File).nullable(),

  fecha_nacimiento: z.date({
    message: "Debe Ingresar Una Fecha Requerida",
    required_error: "La Fecha Es Requerida",
  }),
  fechaingresoorganismo: z.date({
    message: "Debe Ingresar Una Fecha Requerida",
    required_error: "La Fecha Es Requerida",
  }),
  n_contrato: z
    .string({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    })
    .min(3, { message: "Debe Ingresar Al Menos 3 Caracteres" }),
  sexoid: z.number({
    message: "Debe Ingresar Un Sexo Valido",
    required_error: "El Sexo Es Requerido",
  }),
  estadoCivil: z.number({
    errorMap: () => ({ message: "Debe Seleccionar Un Estado Civil" }),
  }),
});
export type BasicInfoType = z.infer<typeof schemaBasicInfo>;
