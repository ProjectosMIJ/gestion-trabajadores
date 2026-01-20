"use client";

import { getCodeList } from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "date-fns";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
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
            <Table className="mt-6">
              <TableHeader className="bg-gray-100 ">
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Tipo De Nomina</TableHead>
                  <TableHead>Denominacion De Cargo Especifico</TableHead>
                  <TableHead>Denominacion De Cargo</TableHead>
                  <TableHead>Direccion General</TableHead>
                  <TableHead>Direccion De Linea</TableHead>
                  <TableHead>Coordinacion</TableHead>

                  <TableHead>Estatus</TableHead>
                  <TableHead>Organismo Adscrito</TableHead>
                  <TableHead>Fecha de Actualizacion</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {Array.isArray(codeList?.data)
                  ? codeList.data.map((code, i) => (
                      <TableRow key={i}>
                        <TableCell>{code.codigo}</TableCell>

                        <TableCell
                          className={`${
                            code.grado?.grado ? "" : "text-gray-400"
                          }`}
                        >
                          {code.grado?.grado ? code.grado.grado : "N/A"}
                        </TableCell>
                        <TableCell>{code.tiponomina.nomina}</TableCell>
                        <TableCell>
                          {code.denominacioncargoespecifico.cargo}
                        </TableCell>
                        <TableCell>{code.denominacioncargo.cargo}</TableCell>
                        <TableCell>
                          {code.DireccionGeneral.direccion_general}
                        </TableCell>
                        <TableCell>
                          {code.DireccionLinea?.direccion_linea || "N/A"}
                        </TableCell>
                        <TableCell>
                          {code.Coordinacion?.coordinacion || "N/A"}
                        </TableCell>
                        <TableCell className="flex flex-row items-center gap-2">
                          <span
                            className={`p-1 inline-block rounded-2xl ${
                              code.estatusid.estatus == "ACTIVO"
                                ? "bg-red-200 border-2 border-red-700"
                                : "bg-green-200/65 border-2 border-green-700 "
                            }`}
                          ></span>
                          {code.estatusid.estatus}
                        </TableCell>
                        <TableCell
                        // className={`${
                        //   code.OrganismoAdscrito ? "" : "text-gray-400"
                        // }`}
                        >
                          {/* {code.OrganismoAdscrito
                          ? code.OrganismoAdscrito
                          : "N/A"} */}
                        </TableCell>
                        <TableCell>
                          {formatDate(code.fecha_actualizacion, "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell
                          className={`${
                            code.observaciones ? "" : "text-gray-400"
                          }`}
                        >
                          {code.observaciones ? code.observaciones : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  : "NO HAY CODIGOS"}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
