"use client";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "../ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  schemaCreateCoordinationDirection,
  schemaCreateDirectionLineDirection,
} from "@/app/dependencias/crear-dependencia-direccion/schema/schemaCreateDirectionDependency";
import { useEffect, useState, useTransition } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ApiResponse,
  Coordination,
  DirectionGeneral,
  DirectionLine,
} from "@/app/types/types";
import {
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
} from "@/app/api/getInfoRac";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loading from "../loading/loading";
import {
  createDirectionCordination,
  createDirectionLine,
} from "@/app/dependencias/crear-dependencia-direccion/action/createDirectionDependecy";

export default function FormCreateDirectionDependency() {
  const [isPending, startTransition] = useTransition();
  const [create, setCreate] = useState<string>("create-direction-line");
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
  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<number>(0);

  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const directionGeneral = await getDirectionGeneral();
        console.log(directionGeneral);
        if (Array.isArray(directionGeneral.data)) {
          setDirectionGeneral(directionGeneral);
        }
      } catch (error) {
        toast.error("Error cargando datos");
      }
    };

    loadData();
  }, []);
  const formDirection = useForm({
    resolver: zodResolver(schemaCreateDirectionLineDirection),
    defaultValues: {
      direccionGeneral: 0,
      Codigo: "",
      direccion_linea: "",
    },
  });
  const formCordination = useForm({
    resolver: zodResolver(schemaCreateCoordinationDirection),
    defaultValues: {
      direccionLinea: 0,
      Codigo: "",
      coordinacion: "",
    },
  });
  useEffect(() => {
    formDirection.setValue("direccionGeneral", selecteIdDirectionGeneral);
  }, [selecteIdDirectionGeneral]);
  useEffect(() => {
    formCordination.setValue("direccionLinea", selecteIdDirectionLine);
  }, [selecteIdDirectionLine]);

  const getByDirectionLine = async (id: string) => {
    const directionLine = await getDirectionLine(id);
    if (Array.isArray(directionLine.data)) setDirectionLine(directionLine);
  };
  const getByCoordination = async (id: string) => {
    const coordination = await getCoordination(id);
    if (Array.isArray(coordination.data)) setCoordination(coordination);
  };

  const onSubmitDirection = (
    values: z.infer<typeof schemaCreateDirectionLineDirection>,
  ) => {
    startTransition(async () => {
      const response = await createDirectionLine(values);
      if (response.success) {
        toast.success(response.message);
        formDirection.reset({
          Codigo: "",
          direccion_linea: "",
          direccionGeneral: 0,
        });
      } else {
        toast.error(response.message);
      }
    });
  };
  const onSubmitCordination = (
    values: z.infer<typeof schemaCreateCoordinationDirection>,
  ) => {
    startTransition(async () => {
      const response = await createDirectionCordination(values);
      if (response.success) {
        toast.success(response.message);
        formCordination.reset({
          Codigo: "",
          coordinacion: "",
          direccionLinea: 0,
        });
      } else {
        toast.error(response.message);
      }
    });
  };
  return (
    <>
      {isPending ? (
        <Loading />
      ) : (
        <>
          <Card>
            <CardContent className="space-y-6">
              <div className={"flex flex-col gap-2"}>
                <div className={`grid grid-cols-2 w-full gap-4`}>
                  <div
                    className={`space-y-2 ${create === "create-coordination" ? "" : "col-span-2"}`}
                  >
                    <Label>Direccion General</Label>
                    <Select
                      onValueChange={(value) => {
                        getByDirectionLine(value);
                        setSelecteIdDirectionGeneral(Number.parseInt(value));
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
                  </div>
                  {create === "create-coordination" && (
                    <div className="space-y-2">
                      <Label>Direccion De Linea</Label>

                      <Select
                        onValueChange={(value) => {
                          getByCoordination(value);
                          setSelecteIdDirectionLine(Number.parseInt(value));
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
                    </div>
                  )}
                </div>

                <RadioGroup
                  defaultValue="create-direction-line"
                  onValueChange={(e) => setCreate(e)}
                  className="flex "
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      className="cursor-pointer"
                      value="create-direction-line"
                      id="r1"
                    />
                    <Label className="cursor-pointer" htmlFor="r1">
                      Crear Direccion De Linea
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      className="cursor-pointer"
                      value="create-coordination"
                      id="r2"
                    />
                    <Label className="cursor-pointer" htmlFor="r2">
                      Crear Coordinacion De Linea
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              {create === "create-direction-line" && (
                <div>
                  <Form {...formDirection}>
                    <form
                      onSubmit={formDirection.handleSubmit(onSubmitDirection)}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2  place-content-stretch place-items-start gap-3 w-full  ">
                        <FormField
                          name="Codigo"
                          control={formDirection.control}
                          render={({ field }) => (
                            <FormItem className="w-full truncate p-0.5">
                              <FormLabel>
                                Codigo De La Direccion De Linea
                              </FormLabel>
                              <FormControl>
                                <Input {...field} type="number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="direccion_linea"
                          control={formDirection.control}
                          render={({ field }) => (
                            <FormItem className="w-full truncate p-0.5">
                              <FormLabel>
                                Nombre De La Direccion De Linea
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button className="w-full">
                        Crear Direccion De Linea
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
              {create === "create-coordination" && (
                <div>
                  <Form {...formCordination}>
                    <form
                      onSubmit={formCordination.handleSubmit(
                        onSubmitCordination,
                      )}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2  place-content-stretch place-items-start gap-3 w-full ">
                        <FormField
                          name="Codigo"
                          control={formCordination.control}
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
                          name="coordinacion"
                          control={formCordination.control}
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
                      <Button className="w-full">Crear Coordinacion</Button>
                    </form>
                  </Form>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
