"use client";

import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaAsignCode } from "@/app/personal/asignar-codigo/schema/schema-asign-code";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
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
  getNominaPasivo,
  getStatusEmployee,
} from "@/app/api/getInfoRac";
import {
  ApiResponse,
  Code,
  Coordination,
  DirectionGeneral,
  DirectionLine,
  EmployeeInfo,
  Nomina,
  Status,
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
import { Spinner } from "../ui/spinner";
import z, { boolean } from "zod";
import { AsignCode } from "@/app/personal/asignar-codigo/actions/asign-code";
import { schemaPasivo } from "@/app/personal/cambiar-pasivo/schema/schemaPasivo";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import GestionAction from "@/app/personal/cambiar-pasivo/actions/gestion-persona-action";
export function PasivoForm() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined
  );

  const [employee, setEmployee] = useState<EmployeeInfo | []>();
  const [isPending, startTransition] = useTransition();
  const [statusEmployee, setStatusEmployee] = useState<ApiResponse<Status[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [nominaPasivo, setNominaPasivo] = useState<ApiResponse<Nomina[]>>({
    status: "",
    message: "",
    data: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusEmployee, nominaPasivo] = await Promise.all([
          getStatusEmployee(),
          getNominaPasivo(),
        ]);
        if (Array.isArray(statusEmployee.data)) {
          setStatusEmployee(statusEmployee);
        }
        if (Array.isArray(nominaPasivo.data)) {
          setNominaPasivo(nominaPasivo);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);

  const form = useForm({
    resolver: zodResolver(schemaPasivo),
    defaultValues: {
      estatus_id: 0,
      usuario_id: 0,
      motivo: "",
      tiponominaid: 0,
      codigo_nuevo: "",
      liberar_activos: false,
    },
  });
  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeInfo(searchEmployee);
      setEmployee(getEmployee.data);
    }
  };

  const onSubmit = (data: z.infer<typeof schemaPasivo>) => {
    startTransition(async () => {
      if (!Array.isArray(employee) && employee?.cedulaidentidad) {
        const response = await GestionAction(data, 5, employee.cedulaidentidad);
        if (response.success) {
          toast.success(response.message);
          setEmployee([]);
          setSearchEmployee("");
        } else {
          toast.error(response.message);
        }
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

          {employee && !Array.isArray(employee) && (
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2"
                >
                  <FormField
                    control={form.control}
                    name="estatus_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listado De Codigos Disponibles</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
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
                            {statusEmployee.data.map((status, i) => (
                              <SelectItem key={i} value={`${status.id}`}>
                                {status.estatus}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("estatus_id") ==
                    statusEmployee.data.find((v) => v.estatus === "PASIVO")
                      ?.id && (
                    <>
                      <FormField
                        control={form.control}
                        name="tiponominaid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Listado De Nominas De Jubilados
                            </FormLabel>
                            <Select
                              onValueChange={(values) => {
                                field.onChange(Number.parseInt(values));
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full truncate">
                                  <SelectValue
                                    placeholder={"Seleccione Una Nomina"}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nominaPasivo.data.map((nomina, i) => (
                                  <SelectItem key={i} value={`${nomina.id}`}>
                                    {nomina.nomina}
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
                        name="codigo_nuevo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ingrese El Codigo A Asignar</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ingrese El Codigo"
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-row gap-2 justify-end">
                        <Label>Desea Liberar El Cargo Activo</Label>
                        <Switch
                          onCheckedChange={(boolean) => {
                            form.setValue("liberar_activos", boolean);
                          }}
                        />
                      </div>
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="motivo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo</FormLabel>
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
                  <Button className="w-full mt-2">Asignar Codigo</Button>
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
                  <p>
                    Ubicacion Geografia: {employee.estado.estado},{" "}
                    {employee.municipio.municipio},{" "}
                    {employee.parroquia.parroquia}
                  </p>
                  <p>Direccion Exacta: {employee.direccion_exacta}</p>
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
