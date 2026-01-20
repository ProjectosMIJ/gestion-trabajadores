"use client";

import { getCodeList } from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { ApiResponse, Code, ErrorFetch } from "@/app/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "date-fns";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../../../components/ui/card";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";

export function CodeListPage() {
  const [codeList, setCodeList] = useState<ApiResponse<Code[] | ErrorFetch>>({
    status: "",
    message: "",
    data: [],
  });
  const [originCodeList, setOriginCodeList] = useState<
    ApiResponse<Code[] | ErrorFetch>
  >({
    status: "",
    message: "",
    data: [],
  });

  useEffect(() => {
    const load = async () => {
      const codeListRes = await getCodeList();
      setOriginCodeList(codeListRes);
      setCodeList(codeListRes);
    };
    load();
  }, [originCodeList.status]);

  const searchInCodeList = (code: string) => {
    if (Array.isArray(originCodeList.data)) {
      const filteredCodes = originCodeList.data.filter((item) =>
        item.codigo.toLowerCase().includes(code.toLowerCase()),
      );
      setCodeList({ ...originCodeList, data: filteredCodes });
      return;
    }
    if (originCodeList.data && !Array.isArray(originCodeList.data)) {
      setCodeList(originCodeList);
    }
  };

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
            <div className="flex flex-row items-center justify-start gap-4">
              <div className="mt-4 w-full max-w-sm flex flex-col gap-2">
                <Label htmlFor="search-code">Buscar Codigo</Label>
                <Input
                  id="search-code"
                  type="search"
                  placeholder="0000"
                  onChange={(e) => {
                    searchInCodeList(e.target.value);
                  }}
                />
              </div>
              {/* <div className="mt-4 w-full max-w-sm flex flex-col gap-2">
                <Label htmlFor="search-code">Buscar Tipo De Nomina</Label>
                <Select
                  onValueChange={(value) => {
                    searchInTypeNomina(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona un Estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Estatus</SelectLabel>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="vacante">Vacante</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div> */}
            </div>
          </CardHeader>
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
              {Array.isArray(codeList.data)
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
        </CardContent>
      </Card>
    </>
  );
}
