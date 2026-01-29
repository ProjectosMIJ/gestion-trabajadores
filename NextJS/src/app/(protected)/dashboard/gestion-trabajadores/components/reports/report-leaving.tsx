"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import {
  getCargo,
  getCargoEspecifico,
  getCoordination,
  getDependency,
  getDirectionGeneralById,
  getDirectionLine,
  getGrado,
  getNominaGeneral,
  getReportConfigEmployee,
  getReportConfigLeaving,
  getSex,
  postReport,
} from "../../api/getInfoRac";

import { ApiResponse, Leaving } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import ExportButton from "@/components/ui/ExportButtonPDF";
import { Input } from "@/components/ui/input";
import PDFView from "@/components/ui/PDFView";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { ReportLeavingPDF } from "../../reportes/egresados/pdf/reportLeavingPDF";
import {
  schemaReportLeaving,
  SchemaReportLeavingType,
} from "../../reportes/egresados/schema/report-schema-leaving";
import TableReportLeaving from "../../reportes/egresados/tableEmployeesReport/page";
import Loading from "../loading/loading";

export default function ReportLeaving() {
  const [isPending, startTransition] = useTransition();
  const [reportListLeaving, setReportListLeaving] = useState<
    ApiResponse<Leaving[] | null>
  >({
    data: [],
    message: "",
    status: "",
  });
  const { data: session } = useSession();
  const [dependencyId, setDependencyId] = useState<number>(0);

  const [directionGeneralId, setDirectionGeneralId] = useState<string | null>(
    null,
  );
  const [directionLineId, setDirectionLineId] = useState<string | null>(null);

  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR(
      dependencyId ? ["directionGeneral", dependencyId] : null,
      async () => await getDirectionGeneralById(dependencyId),
    );
  const { data: dependency, isLoading: isLoadingDependency } = useSWR(
    "dependency",
    async () => await getDependency(),
  );
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    directionGeneralId ? ["directionLine", directionGeneralId] : null,
    async () => await getDirectionLine(directionGeneralId!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    directionLineId ? ["coordination", directionLineId] : null,
    async () => await getCoordination(directionLineId!),
  );
  const { data: sex, isLoading: isLoadingSex } = useSWR(
    "sex",
    async () => await getSex(),
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
    async () => await getNominaGeneral(),
  );
  const { data: grado, isLoading: isLoadingGrado } = useSWR("grado", async () =>
    getGrado(),
  );
  const { data: reportLeaving, isLoading: isLoadingReporLeaving } = useSWR(
    "reportLeaving",
    async () => await getReportConfigLeaving(),
  );

  const form = useForm({
    resolver: zodResolver(schemaReportLeaving),
    defaultValues: {
      categoria: "egresados",
      agrupar_por: "direccion_general",
      tipo_reporte: "lista",
      filtros: {
        dependencia_id: undefined,
        direccion_general_id: undefined,
        direccion_linea_id: undefined,

        coordinacion_id: undefined,
        sexo_id: undefined,
        nomina_id: undefined,
        grado_id: undefined,
        cargo_id: undefined,
        cargo_especifico_id: undefined,
      },
    },
  });
  if (!session) {
    return (
      <Loading promiseMessage="Validando Sesion Para Generar El Reporte"></Loading>
    );
  }
  const onSubmit = (data: SchemaReportLeavingType) => {
    const payload = {
      ...data,
      filtros: {
        dependencia_id:
          session.user.role !== "admin"
            ? Number(session.user.dependency?.id)
            : undefined,
        direccion_general_id:
          session.user.role !== "admin"
            ? Number(session.user.directionGeneral?.id)
            : undefined,
        direccion_linea_id:
          session.user.role !== "admin"
            ? Number(session.user.direccionLine?.id)
            : null,
        coordinacion_id:
          session.user.role !== "admin"
            ? Number(session.user.coordination?.id)
            : null,
      },
    };
    startTransition(async () => {
      const reponse = await postReport<
        SchemaReportLeavingType,
        Leaving[] | null
      >(payload);
      setReportListLeaving(reponse);
      form.reset();
    });
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          {isPending ? (
            <Loading promiseMessage="Consultando Reporte" />
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 grid grid-cols-3 min-h-screen gap-2"
            >
              <div className="flex flex-col gap-2">
                <FormField
                  control={form.control}
                  name="agrupar_por"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agrupar Por</FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(values);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingReporLeaving ? "Cargando Agrupaciones" : "Seleccione una Agrupacion"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reportLeaving?.data.agrupaciones.map(
                            (agrupaciones, i) => (
                              <SelectItem key={i} value={agrupaciones}>
                                {agrupaciones}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className=" bg-blue-600 hover:bg-blue-800 cursor-pointer sticky top-[2px]">
                  Consultar Reporte
                </Button>
                {session.user.role == "admin" && (
                  <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-green-600">
                    <legend className="text-green-800 font-semibold">
                      Direcciones{" "}
                    </legend>
                    <FormField
                      control={form.control}
                      name="filtros.dependencia_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dependencia</FormLabel>
                          <Select
                            onValueChange={(values) => {
                              field.onChange(Number.parseInt(values));
                              setDependencyId(Number.parseInt(values));
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue
                                  placeholder={`${isLoadingDependency ? "Cargando Depedencias" : "Seleccione una Dependencia"}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {dependency?.data.map((dependencia, i) => (
                                <SelectItem key={i} value={`${dependencia.id}`}>
                                  {dependencia.Codigo}-{dependencia.dependencia}
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
                      name="filtros.direccion_general_id"
                      render={({ field }) => (
                        <FormItem>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="filtros.direccion_linea_id"
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="filtros.coordinacion_id"
                      render={({ field }) => (
                        <FormItem>
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
                  </fieldset>
                )}

                <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-red-800">
                  <legend className="text-red-900 font-semibold">
                    Informacion De Cargo
                  </legend>
                  <FormField
                    control={form.control}
                    name="filtros.cargo_especifico_id"
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
                    name="filtros.cargo_id"
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
                    name="filtros.nomina_id"
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
                    name="filtros.grado_id"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
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
                </fieldset>

                <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-black">
                  <legend className="text-black font-semibold">
                    Informacion Basica
                  </legend>
                  <FormField
                    control={form.control}
                    name={`filtros.sexo_id`}
                    render={({ field }) => (
                      <FormItem className=" cursor-pointer">
                        <FormLabel className="cursor-pointer">Sexo </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingSex ? "Cargando Generos" : "Seleccione un Genero"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sex?.data.map((v, i) => (
                              <SelectItem value={`${v.id}`} key={i}>
                                {v.sexo}
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
                    name="filtros.edad_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad Minima</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingrese Una  Minima"
                            {...field}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="filtros.edad_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edad Maxima</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingrese Una Edad Maxima"
                            {...field}
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              </div>
              <div className="border p-2  col-span-2 rounded-sm h-full">
                {reportListLeaving.data !== null &&
                reportListLeaving.data !== undefined &&
                reportListLeaving.data.length > 0 ? (
                  <div className="sticky top-0">
                    <TableReportLeaving leaving={reportListLeaving.data} />
                    <ExportButton
                      className="w-full cursor-pointer"
                      document={
                        <ReportLeavingPDF
                          id={session.user.cedula}
                          leaving={reportListLeaving.data}
                        />
                      }
                      fileName="nomina.pdf"
                    />

                    <PDFView
                      document={
                        <ReportLeavingPDF
                          id={session.user.cedula}
                          leaving={reportListLeaving.data}
                        />
                      }
                      className="h-120 w-full"
                    />
                  </div>
                ) : (
                  <Card className="border-none shadow-none">
                    <CardHeader>
                      <CardTitle>
                        Eliges Las Directivas Para Generar El Reporte
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Loading
                        promiseMessage="No Hay Informacion Que Cumpla Con Las Directivas"
                        className="w-full h-full border-none shadow-none animate-bounce bg-transparent mt-10"
                      ></Loading>
                    </CardContent>
                  </Card>
                )}
              </div>
            </form>
          )}
        </Form>
      </CardContent>
    </Card>
  );
}
