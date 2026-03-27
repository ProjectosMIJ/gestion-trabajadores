"use server";
import { apiFetchGet } from "@/lib/utils";
import { ApiResponse, Code } from "./../../../../types/types";

export const getPasiveSearch = async <T>({
  searchParams,
}: {
  searchParams: string;
}) => {
  const url = searchParams && `employee/pasivo/?${searchParams}`;
  return await apiFetchGet<T>(url);
};

export const getCodeListPasiveSearch = async ({
  searchParams,
}: {
  searchParams: string | undefined;
}): Promise<ApiResponse<Code[]>> => {
  return await apiFetchGet<Code[]>(`cargos/pasivo/?${searchParams}`);
};
