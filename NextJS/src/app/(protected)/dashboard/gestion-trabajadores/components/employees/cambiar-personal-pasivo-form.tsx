"use client";

import {
  getEmployeeInfo,
  getNominaPasivo,
  getStatusEmployee,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import GestionAction from "@/app/(protected)/dashboard/gestion-trabajadores/personal/cambiar-pasivo/actions/gestion-persona-action";
import { schemaPasivo } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/cambiar-pasivo/schema/schemaPasivo";
import { ApiResponse, EmployeeInfo, Nomina, Status } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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
import { Switch } from "../../../../../../components/ui/switch";
import { Textarea } from "../../../../../../components/ui/textarea";
export function PasivoForm() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
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
        const response = await GestionAction(data, employee.cedulaidentidad);
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
  const estatusId = useWatch({
    control: form.control,
    name: "estatus_id",
  });
  const validatePeace =
    estatusId === statusEmployee.data.find((v) => v.estatus === "PASIVO")?.id;
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
                  {validatePeace && (
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
                  <Button className="w-full mt-2" disabled={isPending}>
                    {isPending ? "Cargando" : "Ejecutar Cambio"}
                  </Button>
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
