"use client";
import { Suspense, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getAcademyLevel,
  getCargo,
  getCargoEspecifico,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getGrado,
  getNomina,
  getStates,
  getStatus,
  getUbicacionAdministrativa,
  getUbicacionFisica,
} from "@/app/api/getInfoRac";
import {
  ApiResponse,
  Cargo,
  Coordination,
  DirectionGeneral,
  DirectionLine,
  Grado,
  Nomina,
  Status,
  UbicacionAdministrativa,
  UbicacionFisica,
} from "@/app/types/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaCode } from "@/app/personal/crear-codigo/schemas/schemaCode";
import { z } from "zod";
import { toast } from "sonner";
import { createCodeAction } from "@/app/personal/crear-codigo/actions/createCode";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";

interface CodigoCatalogFormProps {
  onSuccess?: (bool: boolean) => true | false;
}

export function CodigoCatalogForm({ onSuccess }: CodigoCatalogFormProps) {
  const [sendData, setSendData] = useState(false);
  const [cargoEspecifico, setCargoEspecifico] = useState<ApiResponse<Cargo[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [cargo, setCargo] = useState<ApiResponse<Cargo[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [nomina, setNomina] = useState<ApiResponse<Nomina[]>>({
    status: "",
    message: "",
    data: [],
  });

  const [grado, setGrado] = useState<ApiResponse<Grado[]>>({
    status: "",
    message: "",
    data: [],
  });
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
  const [activeDirectionLine, setActiveDirectionLine] =
    useState<boolean>(false);
  const [activeCoordination, setActiveCoordination] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          denominacionCargoEspecifico,
          denominacionCargo,
          tipoNomina,
          grado,
          directionGeneral,
        ] = await Promise.all([
          getCargoEspecifico(),
          getCargo(),
          getNomina(),
          getGrado(),
          getDirectionGeneral(),
        ]);

        if (Array.isArray(denominacionCargoEspecifico.data)) {
          setCargoEspecifico(denominacionCargoEspecifico);
        }
        if (Array.isArray(denominacionCargo.data)) {
          setCargo(denominacionCargo);
        }
        if (Array.isArray(tipoNomina.data)) {
          setNomina(tipoNomina);
        }
        if (Array.isArray(grado.data)) {
          setGrado(grado);
        }
        if (Array.isArray(directionGeneral.data)) {
          setDirectionGeneral(directionGeneral);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);
  useEffect(() => {
    if (!activeDirectionLine) form.setValue("DireccionLinea", 0);
  }, [activeDirectionLine]);
  useEffect(() => {
    if (!activeCoordination || !activeDirectionLine)
      form.setValue("Coordinacion", 0);
  }, [activeCoordination]);

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
  const getByDirectionLine = async (id: string) => {
    const directionLine = await getDirectionLine(id);
    if (Array.isArray(directionLine.data)) setDirectionLine(directionLine);
  };
  const getByCoordination = async (id: string) => {
    const coordination = await getCoordination(id);
    if (Array.isArray(coordination.data)) setCoordination(coordination);
  };
  async function onSubmit(data: z.infer<typeof schemaCode>) {
    startTransition(async () => {
      try {
        const response = await createCodeAction(data, 5);
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
      } finally {
        setSendData(false);
      }
    });
  }
  return (
    <>
      {isPending ? (
        <Card>
          <CardContent>
            <div className="relative w-60 h-60 m-auto flex items-center justify-center">
              <div className="absolute inset-2 rounded-full border-b-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-7 rounded-full border-t-2 border-red-500 animate-spin direction-[reverse] animation-duration-[0.8s]"></div>
              <div className="text-lg text-gray-500 animate-pulse">
                Ejecutando Operacion
              </div>
            </div>
          </CardContent>
        </Card>
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
                                placeholder={
                                  "Seleccione una Denominacion De Cargo Especifico"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cargoEspecifico.data.map((cargo, i) => (
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
                                placeholder={
                                  "Seleccione una Denominacion De Cargo"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cargo.data.map((cargo, i) => (
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
                                placeholder={"Seleccione un Tipo de Nomina"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nomina.data.map((nomina, i) => (
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
                                placeholder={"Seleccione un Grado"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grado.data.map((grado, i) => (
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
                            getByDirectionLine(values);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione una Dirección General"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {directionGeneral.data.map((general, i) => (
                              <SelectItem
                                key={i}
                                value={`${general.id}`}
                                onClick={() =>
                                  getByDirectionLine(general.id.toString())
                                }
                              >
                                {general.Codigo}-{general.direccion_general}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          <div className="flex flex-row items-center text-left gap-2 justify-center">
                            ¿Desea Agregarle Una Dirección De Linea?
                            <Switch onCheckedChange={setActiveDirectionLine} />
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {activeDirectionLine && directionLine.data.length > 0 && (
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
                                getByCoordination(values);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full truncate">
                                  <SelectValue
                                    placeholder={
                                      "Seleccione una Dirección De Linea"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {directionLine.data.map((line, i) => (
                                  <SelectItem
                                    key={i}
                                    value={`${line.id}`}
                                    onClick={() =>
                                      getByCoordination(line.id.toString())
                                    }
                                  >
                                    {line.Codigo}-{line.direccion_linea}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              <div className="flex flex-row items-center text-left justify-center gap-2">
                                ¿Desea Agregarle Una Coordinación?
                                <Switch
                                  onCheckedChange={setActiveCoordination}
                                />
                              </div>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {activeCoordination && coordination.data.length > 0 && (
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
                                        placeholder={
                                          "Seleccione una Coordinación"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {coordination.data.map((coord, i) => (
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
