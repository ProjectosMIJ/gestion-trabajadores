"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "../../../../../../components/ui/card";
import { Label } from "../../../../../../components/ui/label";

import {
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { ApiResponse, Coordination } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import useSWR from "swr";
export default function TableDependencys() {
  const [directionGeneralId, setDirectionGeneralId] = useState<string | null>(
    null,
  );
  const [coordinationId, setCoordinationId] = useState<string | null>(null);

  const { data: directionGeneral } = useSWR(
    "directionGeneral",
    async () => await getDirectionGeneral(),
  );

  const { data: directionLine } = useSWR(
    directionGeneralId ? ["directionLine", directionGeneralId] : null,
    async () => await getDirectionLine(directionGeneralId!),
  );
  const { data: coordination } = useSWR(
    coordinationId ? ["coordination", coordinationId] : null,
    async () => await getCoordination(coordinationId!),
  );

  return (
    <>
      <Card>
        <CardContent>
          <div className={"flex flex-col gap-2 "}>
            <div className={`grid grid-cols-2 w-full gap-4 space-y-5`}>
              <div className={`space-y-2 `}>
                <Label>Direccion General</Label>
                <Select
                  onValueChange={(value) => {
                    setDirectionGeneralId(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Direccion General" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Direcciones De Generales</SelectLabel>
                      {directionGeneral?.data.map((general, i) => (
                        <SelectItem key={i} value={`${general.id}`}>
                          {general.Codigo}-{general.direccion_general}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                  <div className="text-sm text-gray-700 text-[12px]">
                    Consultar Direcciones De Linea En La Direccion General
                  </div>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Direccion De Linea</Label>

                <Select
                  onValueChange={(value) => {
                    setCoordinationId(value);
                  }}
                >
                  <SelectTrigger
                    className="w-full"
                    disabled={
                      directionLine?.data !== undefined &&
                      directionLine!.data?.length > 0
                        ? false
                        : true
                    }
                  >
                    <SelectValue
                      placeholder={`${directionLine?.data !== undefined && directionLine!.data?.length > 0 ? "Seleccionar Direccion De Linea" : "No Posee Direcciones De Linea"}`}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Direcciones De Linea</SelectLabel>
                      {directionLine?.data.map((line, i) => (
                        <SelectItem key={i} value={`${line.id}`}>
                          {line.Codigo}-{line.direccion_linea}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                  <div className="text-[12px] text-gray-700">
                    Consultar Coordinaciones De La Direccion de Linea
                  </div>
                </Select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="border rounded-2xl">
              <Table>
                <TableCaption>Direecciones De Linea</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] font-bold">
                      Codigo
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      Direccion De Linea
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {directionLine?.data.map((direction, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {direction.Codigo}
                      </TableCell>
                      <TableCell className="text-center">
                        {direction.direccion_linea}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="border rounded-2xl">
              <Table className="">
                <TableCaption>Coordinaciones</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] font-bold">
                      Codigo
                    </TableHead>
                    <TableHead className="text-center font-bold">
                      Coordinacion
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coordination?.data.map((coordination, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {coordination.Codigo}
                      </TableCell>
                      <TableCell className="text-center">
                        {coordination.coordinacion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
