"use server";
import { registerInSchema, signInSchema } from "@/lib/zod";
import { z } from "zod";
import { signIn } from "#/auth";
import { AuthError } from "next-auth";

export const loginAction = async (values: z.infer<typeof signInSchema>) => {
  try {
    await signIn("credentials", {
      identification: values.identification,
      password: values.password,
      redirect: false,
    });
    return { success: "Login successful" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials" };
    }
    console.error(error);
    return { error: "Something went wrong" };
  }
};

export const registerAction = async (
  values: z.infer<typeof registerInSchema>,
) => {
  try {
    const validation = registerInSchema.safeParse(values);
    if (!validation.success) {
      return { error: "Datos inválidos", details: validation.error.flatten() };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}/accounts/register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cedula: values.cedula,
          email: values.email,
          password: values.password,
          password2: values.password2,
          departament: values.departament,
          status: values.status,
          phone: values.phone || "",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.errors
          ? Object.values(errorData.errors).join(", ")
          : errorData.error || "Error en el registro",
      };
    }

    return { success: "Registro exitoso" };
  } catch (error) {
    console.error(error);
    return { error: "Algo salió mal al conectar con el servidor" };
  }
};
