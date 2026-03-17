import z from "zod";

export const schemaAds = z.object({
  Organismoadscrito: z
    .string({
      required_error: "Este Campo Es Requerido",
    })
    .min(1, {
      message: "Minimo 3 Caracteres",
    })
    .max(16, { message: "Minimo 16 Caracteres" }),
});

export type AdsType = z.infer<typeof schemaAds>;
