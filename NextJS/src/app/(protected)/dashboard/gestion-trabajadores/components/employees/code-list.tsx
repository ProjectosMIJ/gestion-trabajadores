"use client";

import { getCodeList } from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import TableCode from "../../personal/listado-codigo/tableCodeInfo/page";
import Loading from "../loading/loading";

export function CodeListPage() {
  const { data: codeList, isLoading } = useSWR(
    "codeList",
    async () => await getCodeList(),
  );

  return (
    <>
      <Card>
        <CardContent>
          <CardHeader>
            <CardTitle>
              <h1>Listado De Cargos</h1>
            </CardTitle>
            <CardDescription>
              Listado Detallado De Cargos Registrados En El Sistema
            </CardDescription>
          </CardHeader>
          {isLoading ? (
            <>
              <Loading></Loading>
            </>
          ) : (
            <TableCode codeList={codeList?.data ?? []} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
