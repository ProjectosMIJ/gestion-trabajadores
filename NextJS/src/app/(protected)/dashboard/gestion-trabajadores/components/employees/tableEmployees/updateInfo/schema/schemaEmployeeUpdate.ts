import { z } from "zod";

export const schemaBasicUpdateInfo = z.object({
  nombres: z.string({
    message: "Debe Ingresar Letras",
  }),
  apellidos: z.string({
    message: "Debe Ingresar Letras",
  }),
  file: z
    .instanceof(File)
    .nullable()
    .refine((file) => file !== null, {
      message: "Debe Ingresar Una Imagen De Perfil",
    })
    .refine((file) => file === null || file.size <= 5000000, {
      message: "El Tamaño Maximo De La Imagen Es 5MB",
    })
    .optional(),
  fecha_nacimiento: z
    .date({
      message: "Debe Ingresar Una Fecha Requerida",
      required_error: "La Fecha Es Requerida",
    })
    .refine((date) => date <= new Date(), {
      message: "La Fecha De Nacimiento No Puede Ser En El Futuro",
    })
    .refine(
      (date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 16;
      },
      {
        message: "La Edad Mínima Es De 16 Años",
      },
    )
    .optional(),
  n_contrato: z
    .string({
      message: "Debe Ingresar Informacion Valida",
      required_error: "Este Campo Es Requerido",
    })
    .optional(),
  sexoid: z
    .number({
      message: "Debe Ingresar Un Sexo Valido",
      required_error: "El Sexo Es Requerido",
    })
    .refine((val) => !(val === 0), {
      message: "Debe Seleccionar Un Sexo",
    })
    .optional(),
  estadoCivil: z
    .number({
      errorMap: () => ({ message: "Debe Seleccionar Un Estado Civil" }),
    })
    .refine((val) => !(val == 0), {
      message: "Debe Seleccionar Un Esttado Civil",
    })
    .optional(),
});
export type BasicInfoUpdateType = z.infer<typeof schemaBasicUpdateInfo>;
