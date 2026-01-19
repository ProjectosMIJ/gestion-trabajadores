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
  getEmployeeById,
  getEmployeeInfo,
  getStatusNomina,
} from "@/app/api/getInfoRac";
import {
  ApiResponse,
  Code,
  Coordination,
  DirectionGeneral,
  DirectionLine,
  EmployeeData,
  EmployeeInfo,
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
import z from "zod";
import { AsignCode } from "@/app/personal/asignar-codigo/actions/asign-code";
import { schemaStatusChange } from "@/app/personal/cambiar-estatus/schema/schemaChangeStatus";
import ChangeStatusAction from "@/app/personal/cambiar-estatus/actions/actions-change-status";
import { Textarea } from "../ui/textarea";
export function ChangeStatusForm() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsloading] = useState<boolean>(false);

  const [employee, setEmployee] = useState<ApiResponse<EmployeeData>>();
  const [isPending, startTransition] = useTransition();
  const [statusNomina, setStatusNomina] = useState<ApiResponse<Status[]>>({
    data: [],
    message: "",
    status: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const statusNomina = await getStatusNomina();

        if (Array.isArray(statusNomina.data)) {
          setStatusNomina(statusNomina);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);

  const form = useForm({
    resolver: zodResolver(schemaStatusChange),
    defaultValues: {
      estatus_id: 0,
      cargo: 0,
      motivo: "",
    },
  });
  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeById(searchEmployee);
      setEmployee(getEmployee);
    }
  };

  const onSubmit = (data: z.infer<typeof schemaStatusChange>) => {
    startTransition(async () => {
      const response = await ChangeStatusAction(data, 5);
      if (response.success) {
        toast.success(response.message);
        setSearchEmployee("");
        form.reset({
          cargo: 0,
          estatus_id: 0,
          motivo: "",
        });
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

          {employee && !Array.isArray(employee) && (
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {!isLoading ? (
                    <>
                      {employee.data.asignaciones ? (
                        <>
                          <FormField
                            control={form.control}
                            name="cargo"
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
                                        placeholder={"Seleccione Un Codigo"}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {employee.data.asignaciones.map(
                                      (cargo, i) => (
                                        <SelectItem
                                          key={i}
                                          value={`${cargo.id}`}
                                        >
                                          {
                                            cargo.denominacioncargoespecifico
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
                            name="estatus_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Listado De Estatus</FormLabel>
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
                                    {statusNomina.data.map((status, i) => (
                                      <SelectItem
                                        key={i}
                                        value={`${status.id}`}
                                      >
                                        {status.estatus}
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
                                  Motivo del Cambio De Estatus
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
                        </>
                      ) : (
                        <p>
                          <span className="flex gap-4">
                            Empleado No Posee Asignaciones De Cargo{" "}
                            <CircleAlert className="text-red-500" />
                          </span>
                        </p>
                      )}
                    </>
                  ) : (
                    <Spinner className="m-auto w-32 h-32"> Cargando...</Spinner>
                  )}
                  <Button className="w-full mt-2">Asignar Codigo</Button>
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
                <></>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
