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
  getDependency,
  getDirectionGeneralById,
  getDirectionLine,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { ArrowRightFromLine } from "lucide-react";
export default function TableDependencys() {
  const [dependencyId, setDependencyId] = useState<number | string>("");
  const [directionGeneralId, setDirectionGeneralId] = useState<string | null>(
    null,
  );
  const [coordinationId, setCoordinationId] = useState<string | null>(null);

  const { data: dependency, isLoading: isLoadingDependency } = useSWR(
    "dependency",
    async () => await getDependency(),
  );
  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR(
      dependencyId ? ["directionGeneral", dependencyId] : null,
      async () => await getDirectionGeneralById(dependencyId),
    );

  const { data: directionLine } = useSWR(
    directionGeneralId ? ["directionLine", directionGeneralId] : null,
    async () => await getDirectionLine(directionGeneralId!),
  );
  const listDirectionGeneralLevel = useMemo(() => {
    if (!directionGeneral?.data) return [];
    return directionGeneral.data.filter((v) => {
      const lastValue = v.Codigo?.at(-1);
      const ultimoDigito = Number.parseInt(lastValue ?? "0");
      return !Number.isNaN(ultimoDigito) && ultimoDigito === 0;
    });
  }, [directionLine?.data]);

  const listCoordinationGeneralLevel = useMemo(() => {
    if (!directionGeneral?.data) return [];
    return directionGeneral.data.filter((v) => {
      const lastValue = v.Codigo?.at(-1);
      const ultimoDigito = Number.parseInt(lastValue ?? "0");
      return !Number.isNaN(ultimoDigito) && ultimoDigito !== 0;
    });
  }, [directionLine?.data]);

  const listDirectionLineLevel = useMemo(() => {
    if (!directionLine?.data) return [];
    return directionLine.data.filter((v) => {
      const lastValue = v.Codigo?.at(-1);
      const ultimoDigito = Number.parseInt(lastValue ?? "0");
      return !Number.isNaN(ultimoDigito) && ultimoDigito === 0;
    });
  }, [directionLine?.data]);
  const listCoordinationLevelDirectionLine = useMemo(() => {
    return (
      directionLine?.data.filter((v) => {
        const lastValue = v.Codigo?.at(-1);
        const ultimoDigito = Number.parseInt(lastValue ?? "0");
        return !Number.isNaN(ultimoDigito) && ultimoDigito !== 0;
      }) || []
    );
  }, [directionLine?.data]);
  const { data: coordination } = useSWR(
    coordinationId ? ["coordination", coordinationId] : null,
    async () => await getCoordination(coordinationId!),
  );

  return (
    <>
      <Card>
        <CardContent>
          <div className={`grid grid-cols-2 w-full gap-4 space-y-5`}>
            <div className={`col-span-2 space-y-2`}>
              <Label>Dependencia</Label>
              <Select
                onValueChange={(value) => {
                  setDependencyId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar Dependencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Direcciones De Generales</SelectLabel>
                    {dependency?.data.map((dp, i) => (
                      <SelectItem key={i} value={`${dp.id}`}>
                        {dp.Codigo}-{dp.dependencia}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
                <div className="text-sm text-gray-700 text-[12px]">
                  Consultar Direcciones De Generales En La Dependencia
                </div>
              </Select>
            </div>

            <div className={`space-y-2 `}>
              <Label>Dirección General / Coordinación</Label>
              <Select
                onValueChange={(value) => {
                  setDirectionGeneralId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar Dirección General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      Direcciones De General / Coordinación
                    </SelectLabel>
                    {directionGeneral?.data.map((general, i) => (
                      <SelectItem key={i} value={`${general.id}`}>
                        {general.Codigo}-{general.direccion_general}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
                <div className="text-sm text-gray-700 text-[12px]">
                  Consultar Direcciones De Linea En La Dirección General
                </div>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dirección De Linea / Coordinacion</Label>

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
                    placeholder={`${directionLine?.data !== undefined && directionLine!.data?.length > 0 ? "Seleccionar Dirección De Linea" : "No Posee Direcciones De Linea"}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Dirección De Linea / Coordinacion</SelectLabel>
                    {directionLine?.data.map((line, i) => (
                      <SelectItem key={i} value={`${line.id}`}>
                        {line.Codigo}-{line.direccion_linea}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
                <div className="text-[12px] text-gray-700">
                  Consultar Coordinaciones De La Dirección De Linea
                </div>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {/* DIRECCIOENS COORDINACIOENS DE LINEA */}
            <div className="overflow-auto h-70     rounded-2xl flex col-span-2 w-full gap-2 justify-between">
              <div className="flex-1 flex flex-row overflow-y-auto h-70  border border-blue-700  rounded-2xl">
                <Table>
                  <TableCaption>
                    Coordinaciones Adjuntas A La Dependencia
                  </TableCaption>
                  <TableHeader className="bg-blue-600">
                    <TableRow>
                      <TableHead className="w-[100px] font-bold text-white">
                        Código
                      </TableHead>
                      <TableHead className="text-center font-bold text-white">
                        Coordinación
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listCoordinationGeneralLevel?.map((general, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {general.Codigo}
                        </TableCell>
                        <TableCell className="text-center">
                          {general.direccion_general}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="self-center text-7xl text-clip  text-blue-600 font-bold">
                <ArrowRightFromLine size={70} />
              </div>
              <div className="flex-1 flex flex-row overflow-y-auto h-70  border border-blue-700  rounded-2xl">
                <Table>
                  <TableCaption>Direcciones Generales</TableCaption>
                  <TableHeader className="bg-blue-600">
                    <TableRow>
                      <TableHead className="w-[100px] font-bold text-white">
                        Código
                      </TableHead>
                      <TableHead className="text-center font-bold text-white">
                        Dirección General
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listDirectionGeneralLevel?.map((general, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {general.Codigo}
                        </TableCell>
                        <TableCell className="text-center">
                          {general.direccion_general}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex col-span-2 w-full gap-2 justify-between">
              <div className="flex-1 flex flex-row overflow-y-auto h-70  border border-blue-700  rounded-2xl">
                <Table>
                  <TableCaption>
                    Coordinaciones Adjuntas A La Direccion General
                  </TableCaption>
                  <TableHeader className="bg-blue-600 ">
                    <TableRow>
                      <TableHead className="w-[100px] font-bold text-white">
                        Código
                      </TableHead>
                      <TableHead className="text-center font-bold text-white">
                        Coordinación
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listCoordinationLevelDirectionLine?.map((direction, i) => (
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
              <div className="self-center text-7xl text-clip  text-blue-600 font-bold">
                <ArrowRightFromLine size={70} />
              </div>
              <div className="  flex-1  overflow-y-auto h-70  border border-blue-700  rounded-2xl">
                <Table>
                  <TableCaption>Direcciones De Linea</TableCaption>
                  <TableHeader className="bg-blue-600 ">
                    <TableRow>
                      <TableHead className="w-[100px] font-bold text-white">
                        Código
                      </TableHead>
                      <TableHead className="text-center font-bold text-white">
                        Dirección De Linea
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listDirectionLineLevel?.map((direction, i) => (
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
            </div>

            <div className="overflow-auto h-70 col-span-2  border border-blue-700 rounded-2xl">
              <Table className="">
                <TableCaption>Coordinaciones</TableCaption>
                <TableHeader className="bg-blue-600">
                  <TableRow>
                    <TableHead className="w-[100px] font-bold text-white">
                      Código
                    </TableHead>
                    <TableHead className="text-center font-bold text-white">
                      Coordinación
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
