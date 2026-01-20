"use client";

import { useForm } from "react-hook-form";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaAsignCode } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/asignar-codigo/schema/schema-asign-code";
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import { Button } from "../../../../../../components/ui/button";
import { CircleAlert, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  getCodeByCoordination,
  getCodeByDirectionGeneral,
  getCodeByDirectionLine,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getEmployeeInfo,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import {
  ApiResponse,
  Code,
  Coordination,
  DirectionGeneral,
  DirectionLine,
  EmployeeInfo,
} from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "../../../../../../components/ui/spinner";
import z from "zod";
import { AsignCode } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/asignar-codigo/actions/asign-code";
export function AsigCode() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [selecteCodes, setSelecteCodes] = useState<Code[]>([]);
  const [selectedCode, setSelectedCode] = useState<number>();

  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<string>();

  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<string>();

  const [selecteIdCoordination, setSelecteIdCoordination] = useState<string>();

  const [employee, setEmployee] = useState<EmployeeInfo | []>();
  const [isPending, startTransition] = useTransition();
  const [directionGeneral, setDirectionGeneral] = useState<
    ApiResponse<DirectionGeneral[]>
  >({
    status: "",
    message: "",
    data: [],
  });
  const [directionLine, setDirectionLine] = useState<
    ApiResponse<DirectionLine[]>
  >({
    status: "",
    message: "",
    data: [],
  });
  const [coordination, setCoordination] = useState<ApiResponse<Coordination[]>>(
    {
      status: "",
      message: "",
      data: [],
    },
  );

  const loadData = async () => {
    try {
      const directionGeneral = await getDirectionGeneral();

      if (Array.isArray(directionGeneral.data)) {
        setDirectionGeneral(directionGeneral);
      }
    } catch {
      toast.error("Error cargando datos:");
    }
  };
  loadData();

  const form = useForm({
    resolver: zodResolver(schemaAsignCode),
    defaultValues: {
      code: 0,
      employee: "",
    },
  });
  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeInfo(searchEmployee);
      setEmployee(getEmployee.data);
    }
  };
  const getByDirectionLine = async (id: string) => {
    const directionLine = await getDirectionLine(id);
    if (Array.isArray(directionLine.data)) setDirectionLine(directionLine);
  };
  const getByCoordination = async (id: string) => {
    const coordination = await getCoordination(id);
    if (Array.isArray(coordination.data)) setCoordination(coordination);
  };

  const searchCodeByDirectionGeneral = async () => {
    if (!selecteIdDirectionGeneral) {
      return;
    }
    try {
      setIsloading(true);
      setSelecteCodes([]);
      const code = await getCodeByDirectionGeneral(selecteIdDirectionGeneral);
      if (Array.isArray(code.data)) setSelecteCodes(code.data);
      setIsloading(false);
    } catch {
      setIsloading(false);
    } finally {
      setIsloading(false);
    }
  };
  const searchCodeByDirectionLine = async () => {
    if (!selecteIdDirectionLine) {
      return;
    }
    try {
      setIsloading(true);
      setSelecteCodes([]);

      const code = await getCodeByDirectionLine(selecteIdDirectionLine);

      if (Array.isArray(code.data)) setSelecteCodes(code.data);
      setIsloading(false);
    } catch {
      setIsloading(false);
    } finally {
    }
  };
  const searchCodeByCoordination = async () => {
    if (!selecteIdCoordination) {
      return;
    }
    try {
      setIsloading(true);
      setSelecteCodes([]);

      const code = await getCodeByCoordination(selecteIdCoordination);
      if (Array.isArray(code.data)) setSelecteCodes(code.data);
      setIsloading(false);
    } catch {
      setIsloading(false);
    } finally {
      setIsloading(false);
    }
  };
  const onSubmit = (data: z.infer<typeof schemaAsignCode>) => {
    startTransition(async () => {
      const response = await AsignCode(data);
      if (response.success) {
        toast.success(response.message);
        setEmployee([]);
        setSelecteCodes([]);
        setSearchEmployee("");
      } else {
        toast.error(response.message);
      }
    });
  };

  const validateEmployee = () => {
    if (employee && !Array.isArray(employee)) {
      form.setValue("employee", employee.cedulaidentidad);
    }
  };
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
              <Button
                type="button"
                variant={"outline"}
                onClick={() => {
                  loadEmployee();
                  validateEmployee();
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {employee && !Array.isArray(employee) && (
            <div className="space-y-5">
              Buscar El Codigo
              <div className={"flex flex-col gap-2 jus"}>
                <Select
                  onValueChange={(value) => {
                    getByDirectionLine(value);
                    setSelecteIdDirectionGeneral(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Direccion General" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Direcciones De Generales</SelectLabel>
                      {directionGeneral.data.map((general, i) => (
                        <SelectItem key={i} value={`${general.id}`}>
                          {general.Codigo}-{general.direccion_general}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button onClick={searchCodeByDirectionGeneral}>
                  Buscar Codigo Por Direccion General
                </Button>
              </div>
              <div className={"flex flex-col gap-2 jus"}>
                <Select
                  onValueChange={(value) => {
                    getByCoordination(value);
                    setSelecteIdDirectionLine(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Direccion De Linea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Direcciones De Linea</SelectLabel>
                      {directionLine.data.map((line, i) => (
                        <SelectItem key={i} value={`${line.id}`}>
                          {line.Codigo}-{line.direccion_linea}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button onClick={searchCodeByDirectionLine}>
                  Buscar Codigo Por Direccion De Linea
                </Button>
              </div>
              <div className={"flex flex-col gap-2 jus"}>
                <Select
                  onValueChange={(value) => setSelecteIdCoordination(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar Coordinacion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Coordinaciones</SelectLabel>
                      {coordination.data.map((coord, i) => (
                        <SelectItem key={i} value={`${coord.id}`}>
                          {coord.Codigo}-{coord.coordinacion}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button onClick={searchCodeByCoordination}>
                  Buscar Codigo Por Coordinacion
                </Button>
              </div>
            </div>
          )}
          {employee && !Array.isArray(employee) && (
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {selecteCodes && (
                    <>
                      {!isLoading ? (
                        <>
                          <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Listado De Codigos Disponibles
                                </FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                    setSelectedCode(Number.parseInt(values));
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
                                    {selecteCodes.map((codes, i) => (
                                      <SelectItem
                                        key={i}
                                        value={`${codes.id}`}
                                        onClick={() =>
                                          getByCoordination(codes.id.toString())
                                        }
                                      >
                                        {codes.codigo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {selecteCodes.find((v) => v.id === selectedCode) && (
                            <div className="rounded-sm border-2 border-b-emerald-400-400/45 bg-emerald-200/40 p-2 mt-4">
                              <p>
                                Direccion General:{" "}
                                {
                                  selecteCodes.find(
                                    (v) => v.id === selectedCode,
                                  )?.DireccionGeneral.direccion_general
                                }
                              </p>
                              <p>
                                {" "}
                                Direccion De Linea:{" "}
                                {selecteCodes.find((v) => v.id === selectedCode)
                                  ?.DireccionLinea?.direccion_linea
                                  ? selecteCodes.find(
                                      (v) => v.id === selectedCode,
                                    )?.DireccionLinea?.direccion_linea
                                  : "N/A"}
                              </p>
                              <p>
                                {" "}
                                Coordinacion:{" "}
                                {selecteCodes.find((v) => v.id === selectedCode)
                                  ?.Coordinacion?.coordinacion
                                  ? selecteCodes.find(
                                      (v) => v.id === selectedCode,
                                    )?.Coordinacion?.coordinacion
                                  : "N/A"}
                              </p>
                              <p>
                                Organismo Adscrito:{" "}
                                {selecteCodes.find((v) => v.id === selectedCode)
                                  ?.OrganismoAdscrito
                                  ? selecteCodes.find(
                                      (v) => v.id === selectedCode,
                                    )?.OrganismoAdscrito
                                  : "N/A"}
                              </p>
                              <p>
                                Grado:{" "}
                                {selecteCodes.find((v) => v.id === selectedCode)
                                  ?.grado?.grado
                                  ? selecteCodes.find(
                                      (v) => v.id === selectedCode,
                                    )?.grado?.grado
                                  : "N/A"}
                              </p>
                              <p>
                                Cargo:{" "}
                                {
                                  selecteCodes.find(
                                    (v) => v.id === selectedCode,
                                  )?.denominacioncargo.cargo
                                }
                              </p>
                              <p>
                                Cargo Especifico:{" "}
                                {
                                  selecteCodes.find(
                                    (v) => v.id === selectedCode,
                                  )?.denominacioncargoespecifico.cargo
                                }
                              </p>
                              <p>
                                Estatus:{" "}
                                {
                                  selecteCodes.find(
                                    (v) => v.id === selectedCode,
                                  )?.estatusid.estatus
                                }
                              </p>
                              <p>
                                Tipo De Nomina:{" "}
                                {
                                  selecteCodes.find(
                                    (v) => v.id === selectedCode,
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
                        {isPending ? "Asignando Codigo" : "Asignar Codigo"}
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
                !Array.isArray(employee) &&
                "border-2 border-blue-400/45 bg-blue-200/40"
              }  rounded-sm p-2 `}
            >
              {!Array.isArray(employee) ? (
                <>
                  <p>Nombres: {employee.nombres}</p>
                  <p>Apellidos: {employee.apellidos}</p>
                  <p>Cedula: {employee.cedulaidentidad}</p>
                  <p>Estado Civil: {employee.estadoCivil.estadoCivil}</p>
                </>
              ) : (
                <p>
                  <span className="flex gap-4">
                    Trabajador No Encontrado{" "}
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
