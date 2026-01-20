"use client";

import {
  getCodeByCoordination,
  getCodeByDirectionGeneral,
  getCodeByDirectionLine,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getEmployeeById,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { schemaChangeCode } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/cambiar-codigo/schema/schemaChangeCode";
import {
  ApiResponse,
  Code,
  Coordination,
  DirectionGeneral,
  DirectionLine,
  EmployeeData,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import ChangeCodeActions from "../../personal/cambiar-codigo/actions/actions-change-code";
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
import { Textarea } from "../../../../../../components/ui/textarea";
export function ChangeCodeForm() {
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

  const [employee, setEmployee] = useState<ApiResponse<EmployeeData>>();
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
  useEffect(() => {
    const loadData = async () => {
      try {
        const directionGeneral = await getDirectionGeneral();

        if (Array.isArray(directionGeneral.data)) {
          setDirectionGeneral(directionGeneral);
        }
      } catch {
        toast.error("Error cargando datos");
      }
    };

    loadData();
  }, []);

  const form = useForm({
    resolver: zodResolver(schemaChangeCode),
    defaultValues: {
      nuevo_cargo_id: 0,
      motivo: "",
      code_old: 0,
    },
  });
  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeById(searchEmployee);
      setEmployee(getEmployee);
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
      console.log(code);
      if (Array.isArray(code.data)) setSelecteCodes(code.data);
      setIsloading(false);
    } catch {
      setIsloading(false);
    } finally {
      setIsloading(false);
    }
  };
  const onSubmit = (data: z.infer<typeof schemaChangeCode>) => {
    startTransition(async () => {
      const response = await ChangeCodeActions(data);
      if (response.success) {
        toast.success(response.message);
        setSelecteCodes([]);
        form.reset({
          code_old: 0,
          motivo: "",
          nuevo_cargo_id: 0,
        });
        setSearchEmployee("");
      } else {
        toast.error(response.message);
      }
    });
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
          {employee && !Array.isArray(employee.data) && (
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {selecteCodes && (
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
                          <FormField
                            control={form.control}
                            name="motivo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Motivo del Cambio De Cargo
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    id="observaciones"
                                    placeholder="Describa el motivo del cambio de código..."
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="mt-1"
                                    rows={4}
                                  />
                                </FormControl>
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
                !Array.isArray(employee.data) &&
                "border-2 border-blue-400/45 bg-blue-200/40"
              }  rounded-sm p-2 `}
            >
              {!Array.isArray(employee.data) ? (
                <>
                  <p>Nombres: {employee.data.nombres}</p>
                  <p>Apellidos: {employee.data.apellidos}</p>
                  <p>Cedula: {employee.data.cedulaidentidad}</p>
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
