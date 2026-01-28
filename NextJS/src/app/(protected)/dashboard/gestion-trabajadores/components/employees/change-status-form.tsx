"use client";

import {
  getEmployeeById,
  getInternalReason,
  getStatusNomina,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import ChangeStatusAction from "@/app/(protected)/dashboard/gestion-trabajadores/personal/cambiar-estatus/actions/actions-change-status";
import { schemaStatusChange } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/cambiar-estatus/schema/schemaChangeStatus";
import { ApiResponse, EmployeeData } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
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
export function ChangeStatusForm() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsloading] = useState<boolean>(false);

  const [isPending, startTransition] = useTransition();
  const [employee, setEmployee] = useState<ApiResponse<EmployeeData>>();

  const { data: statusNomina, isLoading: isLoadingStatusNomina } = useSWR(
    "statusNomina",
    async () => await getStatusNomina(),
  );
  const { data: internalReason, isLoading: isLoadingInternalReason } = useSWR(
    "motionReason",
    async () => await getInternalReason(),
  );
  const form = useForm({
    resolver: zodResolver(schemaStatusChange),
    defaultValues: {
      estatus_id: 0,
      cargo: 0,
      motivo: 0,
    },
  });
  const loadEmployee = async () => {
    if (searchEmployee) {
      try {
        setIsloading(true);
        const getEmployee = await getEmployeeById(searchEmployee);
        setEmployee(getEmployee);
      } catch {
      } finally {
        setIsloading(false);
      }
    }
  };

  const onSubmit = (data: z.infer<typeof schemaStatusChange>) => {
    startTransition(async () => {
      const response = await ChangeStatusAction(data);
      if (response.success) {
        toast.success(response.message);
        setSearchEmployee("");
        form.reset({
          cargo: 0,
          estatus_id: 0,
          motivo: 0,
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
              <Button
                type="button"
                variant={"outline"}
                className="cursor-pointer"
                onClick={loadEmployee}
              >
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
                      {employee.data !== null &&
                      employee.data.asignaciones.length > 0 ? (
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
                                        placeholder={`${isLoadingStatusNomina ? "Cargando Estatus De Codigos" : "Seleccione Un Codigo"}`}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {statusNomina?.data.map((status, i) => (
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
                                <FormLabel>Motivo De Cambio De Cargo</FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={`${isLoadingInternalReason ? "Cargando Motivos De Cambio De Cargo" : "Seleccione Un Codigo"}`}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {internalReason?.data.map((reason, i) => (
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
                  <Button disabled={isPending} className="w-full mt-2">
                    {isPending ? "Cargando" : "Asignar Codigo"}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {employee && (
            <div
              className={` ${
                !Array.isArray(employee.data) &&
                employee.data !== null &&
                "border-2 border-blue-400/45 bg-blue-200/40 p-2"
              }  rounded-sm  `}
            >
              {!Array.isArray(employee.data) && employee.data !== null && (
                <>
                  <p>Nombres: {employee.data.nombres}</p>
                  <p>Apellidos: {employee.data.apellidos}</p>
                  <p>Cedula: {employee.data.cedulaidentidad}</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
