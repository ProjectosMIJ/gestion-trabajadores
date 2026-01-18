"use client";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { schemaCreateDependency } from "@/app/dependencias/schema/schemaCreateDependency";
import { CreateDependencyAction } from "@/app/dependencias/actions/create-dependencys";
export default function CreateDependency() {
  const [isPending, startTransition] = useTransition();
  const [activeDirectionLine, setActiveDirectionLine] =
    useState<boolean>(false);
  const [activeCoodination, setActiveCoodination] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(schemaCreateDependency),
    defaultValues: {
      Codigo: "",
      direccion_general: "",
      activeCoordination: false,
      activeDirectionLine: false,
      direction_line: {
        Codigo: "",
        direccion_linea: "",
      },
      coordination: {
        Codigo: "",
        coordinacion: "",
      },
    },
  });
  const onSubmit = (data: z.infer<typeof schemaCreateDependency>) => {
    startTransition(async () => {
      const response = await CreateDependencyAction(data);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  return (
    <>
      <Card className="text-black">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 ">
              <div className="grid grid-cols-2  place-content-stretch place-items-start gap-3 w-full ">
                <FormField
                  name="Codigo"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full truncate p-0.5">
                      <FormLabel>Codigo De La Direccion General</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="direccion_general"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full truncate p-0.5">
                      <FormLabel>Nombre De La Direccion General</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row gap-2 items-center justify-end">
                <FormField
                  control={form.control}
                  name="activeDirectionLine"
                  render={({ field }) => (
                    <FormItem className="flex flex-row">
                      <FormLabel>
                        ¿Desea Asignarle una Direccion De Linea A La Direccion
                        General?
                      </FormLabel>
                      <FormControl>
                        <Switch onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {form.watch("activeDirectionLine") && (
                <>
                  <div className="grid grid-cols-2  place-content-stretch place-items-start gap-3 w-full ">
                    <FormField
                      name="direction_line.Codigo"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full truncate p-0.5">
                          <FormLabel>Codigo De La Direccion De Linea</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="direction_line.direccion_linea"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full truncate p-0.5">
                          <FormLabel>Nombre De La Direccion De Linea</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-row gap-2 items-center justify-end">
                    <FormField
                      control={form.control}
                      name="activeCoordination"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <FormLabel>
                            ¿Desea Asignarle una Coordinacion A La Direccion De
                            Linea?
                          </FormLabel>
                          <FormControl>
                            <Switch onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              {form.watch("activeCoordination") && (
                <>
                  <div className="grid grid-cols-2  place-content-stretch place-items-start gap-3 w-full ">
                    <FormField
                      name="coordination.Codigo"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full truncate p-0.5">
                          <FormLabel>Codigo De La Coordinación</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="coordination.coordinacion"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full truncate p-0.5">
                          <FormLabel>Nombre De La Coordinación</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              <Button className="w-full"> Crear Dependencia</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
