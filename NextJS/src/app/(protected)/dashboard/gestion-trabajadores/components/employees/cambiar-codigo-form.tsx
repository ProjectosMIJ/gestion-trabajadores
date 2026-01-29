"use client";

import {
  getCodeByCoordination,
  getCodeByDirectionGeneral,
  getCodeByDirectionLine,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getEmployeeById,
  getMotionReason,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { schemaChangeCode } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/cambiar-codigo/schema/schemaChangeCode";
import { ApiResponse, Code, EmployeeData } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import z from "zod";
import { Button } from "../../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Spinner } from "../../../../../../components/ui/spinner";
import ChangeCodeActions from "../../personal/cambiar-codigo/actions/actions-change-code";
export function ChangeCodeForm() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );

  const [selectedCodeId, setSelectedCodeId] = useState<number>();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [selectedCode, setSelectedCode] = useState<ApiResponse<Code[]>>();
  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<string>();
  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<string>();
  const [selecteIdCoordination, setSelecteIdCoordination] = useState<string>();
  const [employee, setEmployee] = useState<ApiResponse<EmployeeData>>();
  const [isPending, startTransition] = useTransition();
  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR("directionGeneral", async () => await getDirectionGeneral());
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    selecteIdDirectionGeneral
      ? ["directionLine", selecteIdDirectionGeneral]
      : "",
    async () => await getDirectionLine(selecteIdDirectionGeneral!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    selecteIdDirectionLine ? ["coordination", selecteIdDirectionLine] : null,
    async () => await getCoordination(selecteIdDirectionLine!),
  );

  const { data: motionReason, isLoading: isLoadingMotionReason } = useSWR(
    "motionReason",
    async () => await getMotionReason(),
  );
  const searchCodeByGeneral = async (id: string) => {
    const code = await getCodeByDirectionGeneral(id);
    setSelectedCode(code);
  };
  const searchCodeByLine = async (id: string) => {
    const code = await getCodeByDirectionLine(id);
    setSelectedCode(code);
  };
  const searchCodeByCoord = async (id: string) => {
    const code = await getCodeByCoordination(id);
    setSelectedCode(code);
  };
  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeById(searchEmployee);
      setEmployee(getEmployee);
    }
  };

  const onSubmit = (data: z.infer<typeof schemaChangeCode>) => {
    startTransition(async () => {
      const response = await ChangeCodeActions(data);
      if (response.success) {
        toast.success(response.message);
        form.reset({
          code_old: 0,
          motivo: 0,
          nuevo_cargo_id: 0,
        });

        setSearchEmployee("");
      } else {
        toast.error(response.message);
      }
    });
  };
  const form = useForm({
    resolver: zodResolver(schemaChangeCode),
    defaultValues: {
      nuevo_cargo_id: 0,
      motivo: 0,
      code_old: 0,
    },
  });
  return (
    <>
      <Card>
        <CardHeader></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="search-employee">Buscar Trabajador</Label>
            <div className="flex flex-row gap-2">
              <Input
                id="search-employee"
                placeholder="00000000"
                type="number"
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
              />
              <Button type="button" variant={"outline"} onClick={loadEmployee}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {employee && !Array.isArray(employee.data) && (
            <div className="space-y-5">
              Buscar El Codigo
              <div className={"flex flex-col gap-2 jus"}>
                <Select
                  onValueChange={(value) => {
                    setSelecteIdDirectionGeneral(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`${isLoadingDirectionGeneral ? "Cargando Direccioens Generales" : "Seleccionar Direccion General"}`}
                    />
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
                </Select>
                <Button
                  className="cursor-pointer"
                  onClick={() =>
                    searchCodeByGeneral(selecteIdDirectionGeneral!)
                  }
                >
                  Buscar Codigo Por Direccion General
                </Button>
              </div>
              <div className={"flex flex-col gap-2 jus"}>
                <Select
                  onValueChange={(value) => {
                    setSelecteIdDirectionLine(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={` ${isLoadingDirectionLine ? "Cargando Direcciones de Linea" : "Seleccionar Direccion De Linea"}`}
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
                </Select>
                <Button
                  className="cursor-pointer"
                  onClick={() => searchCodeByLine(selecteIdDirectionLine!)}
                >
                  Buscar Codigo Por Direccion De Linea
                </Button>
              </div>
              <div className={"flex flex-col gap-2 jus"}>
                <Select
                  onValueChange={(value) => setSelecteIdCoordination(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={`${isLoadingCoordination ? "Cargando Coordinaciones" : "Seleccionar Coordinacion"} `}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Coordinaciones</SelectLabel>
                      {coordination?.data.map((coord, i) => (
                        <SelectItem key={i} value={`${coord.id}`}>
                          {coord.Codigo}-{coord.coordinacion}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                  <Button
                    className="cursor-pointer"
                    onClick={() => searchCodeByCoord(selecteIdCoordination!)}
                  >
                    Buscar Codigo Por Coordinacion
                  </Button>
                </Select>
              </div>
            </div>
          )}
          {employee && !Array.isArray(employee.data) && (
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {selectedCode && (
                    <>
                      {!isLoading ? (
                        <>
                          <FormField
                            control={form.control}
                            name="code_old"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Listado De Cargos Del Empleado
                                </FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={
                                          "Seleccione Un Cargo Del Empleado"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {employee.data.asignaciones.map(
                                      (codes, i) => (
                                        <SelectItem
                                          key={i}
                                          value={`${codes.id}`}
                                        >
                                          {codes.codigo} -{" "}
                                          {
                                            codes.denominacioncargoespecifico
                                              .cargo
                                          }
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nuevo_cargo_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Listado De Codigos Disponibles
                                </FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                    setSelectedCodeId(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={"Seleccione Un Codigo"}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedCode.data.map((codes, i) => (
                                      <SelectItem key={i} value={`${codes.id}`}>
                                        {codes.codigo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="motivo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Motivo De Cambio De Cargo</FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={`${isLoadingMotionReason ? "Cargando Motivos De Cambio De Cargo" : "Seleccione Un Codigo"}`}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {motionReason?.data.map((reason, i) => (
                                      <SelectItem
                                        key={i}
                                        value={`${reason.id}`}
                                      >
                                        {reason.movimiento}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {selectedCode.data.find(
                            (v) => v.id === selectedCodeId,
                          ) && (
                            <div className="rounded-sm border-2 border-b-emerald-400-400/45 bg-emerald-200/40 p-2 mt-4">
                              <p>
                                Direccion General:{" "}
                                {
                                  selectedCode.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.DireccionGeneral.direccion_general
                                }
                              </p>
                              <p>
                                {" "}
                                Direccion De Linea:{" "}
                                {selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.DireccionLinea?.direccion_linea
                                  ? selectedCode.data.find(
                                      (v) => v.id === selectedCodeId,
                                    )?.DireccionLinea?.direccion_linea
                                  : "N/A"}
                              </p>
                              <p>
                                {" "}
                                Coordinacion:{" "}
                                {selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.Coordinacion?.coordinacion
                                  ? selectedCode.data.find(
                                      (v) => v.id === selectedCodeId,
                                    )?.Coordinacion?.coordinacion
                                  : "N/A"}
                              </p>
                              <p>
                                Organismo Adscrito:{" "}
                                {selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.OrganismoAdscrito
                                  ? selectedCode.data.find(
                                      (v) => v.id === selectedCodeId,
                                    )?.OrganismoAdscrito?.Organismoadscrito
                                  : "N/A"}
                              </p>
                              <p>
                                Grado:{" "}
                                {selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.grado?.grado
                                  ? selectedCode.data.find(
                                      (v) => v.id === selectedCodeId,
                                    )?.grado?.grado
                                  : "N/A"}
                              </p>
                              <p>
                                Cargo:{" "}
                                {
                                  selectedCode.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.denominacioncargo.cargo
                                }
                              </p>
                              <p>
                                Cargo Especifico:{" "}
                                {
                                  selectedCode.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.denominacioncargoespecifico.cargo
                                }
                              </p>
                              <p>
                                Estatus:{" "}
                                {
                                  selectedCode.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.estatusid.estatus
                                }
                              </p>
                              <p>
                                Tipo De Nomina:{" "}
                                {
                                  selectedCode.data.find(
                                    (v) => v.id === selectedCodeId,
                                  )?.tiponomina.nomina
                                }
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <Spinner className="m-auto w-32 h-32">
                          {" "}
                          Cargando...
                        </Spinner>
                      )}
                      <Button className="w-full mt-2" disabled={isPending}>
                        {isPending ? "Cargando..." : "Cambiar Codigo"}
                      </Button>
                    </>
                  )}
                </form>
              </Form>
            </div>
          )}

          {employee && (
            <div
              className={` ${
                !Array.isArray(employee.data) || employee.data !== null
                  ? "border-2 border-blue-400/45 bg-blue-200/40"
                  : "bg-red-700 border-red-400/45"
              }  rounded-sm p-2 `}
            >
              {!Array.isArray(employee.data) && employee.data !== null ? (
                <>
                  <p>Nombres: {employee.data.nombres}</p>
                  <p>Apellidos: {employee.data.apellidos}</p>
                  <p>Cedula: {employee.data.cedulaidentidad}</p>
                </>
              ) : (
                <p>
                  <span className="flex gap-4">
                    El Trabajador No Posee Cargos{" "}
                    <CircleAlert className="text-red-500" />
                  </span>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
