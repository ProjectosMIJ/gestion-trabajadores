"use client";

import {
  getCargo,
  getCargoEspecifico,
  getCodeByCoordinationAll,
  getCodeByDirectionGeneralAll,
  getCodeByDirectionLineAll,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getGrado,
  getNomina,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { ApiResponse, Code } from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import z from "zod";
import { Button } from "../../../../../../components/ui/button";
import { Card, CardContent } from "../../../../../../components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../../components/ui/form";
import { updateCode } from "../../personal/actualizar-codigo/actions/update-code";
import { schemaUpdateCode } from "../../personal/actualizar-codigo/schema/schema-update-code";
import Loading from "../loading/loading";
export function UpdateCode() {
  const [activeDirectionLine, setActiveDirectionLine] =
    useState<boolean>(false);
  const [activeCoordination, setActiveCoordination] = useState<boolean>(false);
  const [selectedCodeId, setSelectedCodeId] = useState<number>();
  const [selectedCode, setSelectedCode] = useState<ApiResponse<Code[]>>();
  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<string>();
  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<string>();
  const [selecteIdCoordination, setSelecteIdCoordination] = useState<string>();
  const [directionGeneralId, setDirectionGeneralId] = useState<string>();
  const [directionLinelId, setDirectionLineId] = useState<string>();

  const [isPending, startTransition] = useTransition();

  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR("directionGeneral", async () => await getDirectionGeneral());
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    selecteIdDirectionGeneral
      ? ["directionLine", selecteIdDirectionGeneral]
      : "",
    async () => await getDirectionLine(selecteIdDirectionGeneral!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    selecteIdDirectionLine ? ["coordination", selecteIdDirectionLine] : null,
    async () => await getCoordination(selecteIdDirectionLine!),
  );
  const { data: directionLineUpdate, isLoading: isLoadingDirectionLineUpdate } =
    useSWR(
      directionGeneralId ? ["directionLineUpdate", directionGeneralId] : "",
      async () => await getDirectionLine(selecteIdDirectionGeneral!),
    );
  const { data: coordinationUpdate, isLoading: isLoadingCoordinationUpdate } =
    useSWR(
      directionLinelId ? ["coordinationUpdate", directionLinelId] : null,
      async () => await getCoordination(selecteIdDirectionLine!),
    );

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
  const searchCodeByGeneral = async (id: string) => {
    const code = await getCodeByDirectionGeneralAll(id);
    setSelectedCode(code);
  };
  const searchCodeByLine = async (id: string) => {
    const code = await getCodeByDirectionLineAll(id);
    setSelectedCode(code);
  };
  const searchCodeByCoord = async (id: string) => {
    const code = await getCodeByCoordinationAll(id);
    setSelectedCode(code);
  };
  const validateDirectionLine = () => {
    if (!activeDirectionLine) form.setValue("DireccionLinea", 0);
  };
  const validateCoordination = () => {
    if (!activeCoordination || !activeDirectionLine) {
      form.setValue("Coordinacion", 0);
    }
  };
  const form = useForm({
    resolver: zodResolver(schemaUpdateCode),
    defaultValues: {
      code: 0,
      denominacioncargoid: 0,
      denominacioncargoespecificoid: 0,
      gradoid: 0,
      tiponominaid: 0,
      DireccionGeneral: 0,
      DireccionLinea: 0,
      Coordinacion: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof schemaUpdateCode>) => {
    startTransition(async () => {
      const response = await updateCode(data);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <Card>
      <CardContent className="space-y-5">
        {isPending ? (
          <Loading promiseMessage="Actualizando Codigo" />
        ) : (
          <>
            <div className="space-y-5">
              Buscar El Codigo
              <div className="grid grid-cols-3 gap-2">
                <div className={"flex flex-col gap-2 jus"}>
                  <Select
                    onValueChange={(value) => {
                      setSelecteIdDirectionGeneral(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={`${isLoadingDirectionGeneral ? "Cargando Direccioens Generales" : "Seleccionar Direccion General"}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Direcciones De Generales</SelectLabel>
                        {directionGeneral?.data.map((general, i) => (
                          <SelectItem key={i} value={`${general.id}`}>
                            {general.Codigo}-{general.direccion_general}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    className="cursor-pointer"
                    onClick={() =>
                      searchCodeByGeneral(selecteIdDirectionGeneral!)
                    }
                  >
                    Buscar Codigo Por Direccion General
                  </Button>
                </div>
                <div className={"flex flex-col gap-2 jus"}>
                  <Select
                    onValueChange={(value) => {
                      setSelecteIdDirectionLine(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={` ${isLoadingDirectionLine ? "Cargando Direcciones de Linea" : "Seleccionar Direccion De Linea"}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Direcciones De Linea</SelectLabel>
                        {directionLine?.data.map((line, i) => (
                          <SelectItem key={i} value={`${line.id}`}>
                            {line.Codigo}-{line.direccion_linea}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    className="cursor-pointer"
                    onClick={() => searchCodeByLine(selecteIdDirectionLine!)}
                  >
                    Buscar Codigo Por Direccion De Linea
                  </Button>
                </div>
                <div className={"flex flex-col gap-2 jus"}>
                  <Select
                    onValueChange={(value) => setSelecteIdCoordination(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={`${isLoadingCoordination ? "Cargando Coordinaciones" : "Seleccionar Coordinacion"} `}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Coordinaciones</SelectLabel>
                        {coordination?.data.map((coord, i) => (
                          <SelectItem key={i} value={`${coord.id}`}>
                            {coord.Codigo}-{coord.coordinacion}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                    <Button
                      className="cursor-pointer"
                      onClick={() => searchCodeByCoord(selecteIdCoordination!)}
                    >
                      Buscar Codigo Por Coordinacion
                    </Button>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  {selectedCode && (
                    <>
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Listado De Codigos Disponibles
                            </FormLabel>
                            <Select
                              onValueChange={(values) => {
                                field.onChange(Number.parseInt(values));
                                setSelectedCodeId(Number.parseInt(values));
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
                                {selectedCode.data.map((codes, i) => (
                                  <SelectItem key={i} value={`${codes.id}`}>
                                    {codes.codigo} -{" "}
                                    {codes.denominacioncargoespecifico.cargo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2 grid grid-cols-2 items-center gap-6 place-content-center">
                        <FormField
                          control={form.control}
                          name="denominacioncargoespecificoid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Denominacion De Cargo Especifico
                              </FormLabel>
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
                                      {general.Codigo}-
                                      {general.direccion_general}
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
                        {activeDirectionLine &&
                          directionLineUpdate?.data?.length! > 0 && (
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
                                            placeholder={`${isLoadingDirectionLineUpdate ? "Cargando Direcciones De Linea" : "Seleccione una Dirección De Linea"}`}
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {directionLineUpdate?.data.map(
                                          (line, i) => (
                                            <SelectItem
                                              key={i}
                                              value={`${line.id}`}
                                            >
                                              {line.Codigo}-
                                              {line.direccion_linea}
                                            </SelectItem>
                                          ),
                                        )}
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
                              {activeCoordination &&
                                coordinationUpdate?.data.length! > 0 && (
                                  <>
                                    <FormField
                                      control={form.control}
                                      name="Coordinacion"
                                      render={({ field }) => (
                                        <FormItem className="col-span-2">
                                          <FormLabel>Coordinacion</FormLabel>
                                          <Select
                                            onValueChange={(values) => {
                                              field.onChange(
                                                Number.parseInt(values),
                                              );
                                            }}
                                          >
                                            <FormControl>
                                              <SelectTrigger className="w-full truncate">
                                                <SelectValue
                                                  placeholder={`${isLoadingCoordinationUpdate ? "Cargando Coordinaciones" : "Seleccione una Coordinación"}`}
                                                />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {coordinationUpdate?.data.map(
                                                (coord, i) => (
                                                  <SelectItem
                                                    key={i}
                                                    value={`${coord.id}`}
                                                  >
                                                    {coord.Codigo}-
                                                    {coord.coordinacion}
                                                  </SelectItem>
                                                ),
                                              )}
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
                      {selectedCode.data.find(
                        (v) => v.id === selectedCodeId,
                      ) && (
                        <div className="rounded-sm border-2 border-b-emerald-400-400/45 bg-emerald-200/40 p-2 mt-4">
                          <p>
                            Direccion General:{" "}
                            {
                              selectedCode.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.DireccionGeneral.direccion_general
                            }
                          </p>
                          <p>
                            {" "}
                            Direccion De Linea:{" "}
                            {selectedCode.data.find(
                              (v) => v.id === selectedCodeId,
                            )?.DireccionLinea?.direccion_linea
                              ? selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.DireccionLinea?.direccion_linea
                              : "N/A"}
                          </p>
                          <p>
                            {" "}
                            Coordinacion:{" "}
                            {selectedCode.data.find(
                              (v) => v.id === selectedCodeId,
                            )?.Coordinacion?.coordinacion
                              ? selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.Coordinacion?.coordinacion
                              : "N/A"}
                          </p>
                          <p>
                            Organismo Adscrito:{" "}
                            {selectedCode.data.find(
                              (v) => v.id === selectedCodeId,
                            )?.OrganismoAdscrito
                              ? selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.OrganismoAdscrito?.Organismoadscrito
                              : "N/A"}
                          </p>
                          <p>
                            Grado:{" "}
                            {selectedCode.data.find(
                              (v) => v.id === selectedCodeId,
                            )?.grado?.grado
                              ? selectedCode.data.find(
                                  (v) => v.id === selectedCodeId,
                                )?.grado?.grado
                              : "N/A"}
                          </p>
                          <p>
                            Cargo:{" "}
                            {
                              selectedCode.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.denominacioncargo.cargo
                            }
                          </p>
                          <p>
                            Cargo Especifico:{" "}
                            {
                              selectedCode.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.denominacioncargoespecifico.cargo
                            }
                          </p>
                          <p>
                            Estatus:{" "}
                            {
                              selectedCode.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.estatusid.estatus
                            }
                          </p>
                          <p>
                            Tipo De Nomina:{" "}
                            {
                              selectedCode.data.find(
                                (v) => v.id === selectedCodeId,
                              )?.tiponomina.nomina
                            }
                          </p>
                        </div>
                      )}

                      <Button
                        className="w-full mt-2 cursor-pointer"
                        disabled={isPending}
                      >
                        {isPending
                          ? "Actualizando Codigo"
                          : "Actualizar Codigo"}
                      </Button>
                    </>
                  )}
                </form>
              </Form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
