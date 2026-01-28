"use client";
import {
  getCargo,
  getCargoEspecifico,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getGrado,
  getNomina,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { createCodeAction } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/crear-codigo/actions/createCode";
import { schemaCode } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/crear-codigo/schemas/schemaCode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { Spinner } from "../../../../../../components/ui/spinner";
import { Switch } from "../../../../../../components/ui/switch";
import Loading from "../loading/loading";

interface CodigoCatalogFormProps {
  onSuccess?: (bool: boolean) => true | false;
}

export function CodigoCatalogForm({ onSuccess }: CodigoCatalogFormProps) {
  const [activeDirectionLine, setActiveDirectionLine] =
    useState<boolean>(false);
  const [activeCoordination, setActiveCoordination] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [directionGeneralId, setDirectionGeneralId] = useState<string>();
  const [directionLinelId, setDirectionLineId] = useState<string>();

  const validateDirectionLine = () => {
    if (!activeDirectionLine) form.setValue("DireccionLinea", 0);
  };
  const validateCoordination = () => {
    if (!activeCoordination || !activeDirectionLine) {
      form.setValue("Coordinacion", 0);
    }
  };
  const form = useForm({
    resolver: zodResolver(schemaCode),
    defaultValues: {
      codigo: "",
      denominacioncargoespecificoid: 0,
      denominacioncargoid: 0,
      gradoid: 0,
      tiponominaid: 0,
      DireccionGeneral: 0,
      DireccionLinea: 0,
      Coordinacion: 0,
    },
  });
  const { data: cargoEspecifico, isLoading: isLoadingCargoEspecifico } = useSWR(
    "cargoEspecifico",
    async () => await getCargoEspecifico(),
  );
  const { data: cargo, isLoading: isLoadingCargo } = useSWR(
    "cargo",
    async () => await getCargo(),
  );
  const { data: nomina, isLoading: isLoadingNomina } = useSWR(
    "nomina",
    async () => await getNomina(),
  );
  const { data: grado, isLoading: isLoadingGrado } = useSWR("grado", async () =>
    getGrado(),
  );
  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR("directionGeneral", async () => await getDirectionGeneral());
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    directionGeneralId ? ["directionLine", directionGeneralId] : null,
    async () => await getDirectionLine(directionGeneralId!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    directionLinelId ? ["coordination", directionLinelId] : null,
    async () => await getCoordination(directionGeneralId!),
  );

  async function onSubmit(data: z.infer<typeof schemaCode>) {
    startTransition(async () => {
      try {
        const response = await createCodeAction(data);
        if (response.success) {
          form.reset({
            codigo: "",
            Coordinacion: 0,
            denominacioncargoespecificoid: 0,
            denominacioncargoid: 0,
            DireccionGeneral: 0,
            DireccionLinea: 0,
            gradoid: 0,
            tiponominaid: 0,
          });
          toast.success(response.message);
          onSuccess?.(true);
        } else {
          toast.error(response.message);
        }
      } catch {
        toast.error("Ocurrio Un Error Al Enviar La informacion");
      }
    });
  }
  return (
    <>
      {isPending ? (
        <Loading />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Código de Posición</CardTitle>
            <CardDescription>
              Ingrese los datos del nuevo código y sus atributos asociados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-2 grid grid-cols-2 items-center gap-6 place-content-center">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Codigo</FormLabel>
                        <FormControl>
                          <Input placeholder="000" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="denominacioncargoespecificoid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Denominacion De Cargo Especifico</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingCargoEspecifico ? "Cargando Cargos Especificos" : "Seleccione una Denominacion De Cargo Especifico"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cargoEspecifico?.data.map((cargo, i) => (
                              <SelectItem key={i} value={`${cargo.id}`}>
                                {cargo.cargo}
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
                    name="denominacioncargoid"
                    render={({ field }) => (
                      <FormItem className=" ">
                        <FormLabel>Denominacion De Cargo</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingCargo ? "Cargando Denominaciones De Cargo" : "Seleccione una Denominacion De Cargo"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cargo?.data.map((cargo, i) => (
                              <SelectItem key={i} value={`${cargo.id}`}>
                                {cargo.cargo}
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
                    name="tiponominaid"
                    render={({ field }) => (
                      <FormItem className=" ">
                        <FormLabel>Tipo de Nomina</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingNomina ? "Cargando Nominas" : "Seleccione un Tipo de Nomina"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nomina?.data.map((nomina, i) => (
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
                    name="gradoid"
                    render={({ field }) => (
                      <FormItem className=" ">
                        <FormLabel>Grado</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingGrado ? "Cargando Grados" : "Seleccione un Grado"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grado?.data.map((grado, i) => (
                              <SelectItem key={i} value={`${grado.id}`}>
                                {grado.grado}
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
                    name="DireccionGeneral"
                    render={({ field }) => (
                      <FormItem
                        className={`${!activeDirectionLine ? "col-span-2" : ""}`}
                      >
                        <FormLabel>Dirección General</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                            setDirectionGeneralId(values);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingDirectionGeneral ? "Cargando Direcciones Generales" : "Seleccione una Dirección General"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {directionGeneral?.data.map((general, i) => (
                              <SelectItem key={i} value={`${general.id}`}>
                                {general.Codigo}-{general.direccion_general}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          <div className="flex flex-row items-center text-left gap-2 justify-center">
                            ¿Desea Agregarle Una Dirección De Linea?
                            <Switch
                              onCheckedChange={(bool) => {
                                setActiveDirectionLine(bool);
                                validateDirectionLine();
                              }}
                            />
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {activeDirectionLine && directionLine?.data?.length! > 0 && (
                    <>
                      <FormField
                        control={form.control}
                        name="DireccionLinea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección De Linea</FormLabel>
                            <Select
                              onValueChange={(values) => {
                                field.onChange(Number.parseInt(values));
                                setDirectionLineId(values);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full truncate">
                                  <SelectValue
                                    placeholder={`${isLoadingDirectionLine ? "Cargando Direcciones De Linea" : "Seleccione una Dirección De Linea"}`}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {directionLine?.data.map((line, i) => (
                                  <SelectItem key={i} value={`${line.id}`}>
                                    {line.Codigo}-{line.direccion_linea}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              <div className="flex flex-row items-center text-left justify-center gap-2">
                                ¿Desea Agregarle Una Coordinación?
                                <Switch
                                  onCheckedChange={(bool) => {
                                    setActiveCoordination(bool);
                                    validateCoordination();
                                  }}
                                />
                              </div>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {activeCoordination && coordination?.data.length! > 0 && (
                        <>
                          <FormField
                            control={form.control}
                            name="Coordinacion"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Coordinacion</FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={`${isLoadingCoordination ? "Cargando Coordinaciones" : "Seleccione una Coordinación"}`}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {coordination?.data.map((coord, i) => (
                                      <SelectItem key={i} value={`${coord.id}`}>
                                        {coord.Codigo}-{coord.coordinacion}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <>
                        <Spinner />
                        Creando Nuevo Codigo...
                      </>
                    ) : (
                      "Crear Nuevo Codigo"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
