"use server";
import { ApiResponse } from "./../../../../types/types";
const apiFetchGet = async <T>(url: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL_SERVER}${url}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  );
  const getResponse: ApiResponse<T> = await response.json();
  return getResponse;
};

export const getPasiveSearch = async <T>({
  searchParams,
}: {
  searchParams: string;
}) => {
  const url =
    searchParams && `employee/pasivo/?cedulaidentidad=${searchParams}`;
  return await apiFetchGet<T>(url);
};
