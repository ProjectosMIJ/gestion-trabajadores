"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CreateDependencyAction } from "../../dependencias/crear-dependencia/actions/create-dependencys";
import { schemaCreateDependency } from "../../dependencias/crear-dependencia/schema/schemaCreateDependency";
import { Button } from "../../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { Input } from "../../../../../../components/ui/input";
import { Switch } from "../../../../../../components/ui/switch";
export default function CreateDependency() {
  const [isPending, startTransition] = useTransition();

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
  const activeDirectionLine = useWatch({
    control: form.control,
    name: "activeDirectionLine",
  });
  const activeCoordination = useWatch({
    control: form.control,
    name: "activeDirectionLine",
  });
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
              {activeDirectionLine && (
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
              {activeCoordination && (
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
              <Button className="w-full" disabled={isPending}>
                {" "}
                {isPending ? "Creando Depedencia" : "Crear Dependencia"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
