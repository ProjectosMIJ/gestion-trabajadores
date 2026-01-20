import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const calcularEdad = (fechaNacimiento: string | number | undefined) => {
  return new Date().getFullYear() - new Date(fechaNacimiento ? fechaNacimiento : '00/00/0000').getFullYear();
};
