"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormDescription,
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
  getAcademyLevel,
  getBloodGroup,
  getCargo,
  getCargoEspecifico,
  getCarrera,
  getConditionDwelling,
  getCoordination,
  getDependency,
  getDirectionGeneralById,
  getDirectionLine,
  getDisability,
  getGrado,
  getMencion,
  getMunicipalitys,
  getNominaGeneral,
  getParish,
  getPatologys,
  getRegion,
  getReportConfigEmployee,
  getSex,
  getStateByRegion,
  postReport,
} from "../../api/getInfoRac";

import { ApiResponse, EmployeeData } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import ExportButton from "@/components/ui/ExportButtonPDF";
import { Input } from "@/components/ui/input";
import PDFView from "@/components/ui/PDFView";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { ReportPDFEmployee } from "../../reportes/empleados/pdf/reportEmployeePDF";
import {
  schemaReportEmployee,
  SchemaReportEmployeeType,
} from "../../reportes/empleados/schema/report-schema-employee";
import TableEmployeeReport from "../../reportes/empleados/tableEmployeesReport/page";
import Loading from "../loading/loading";

export default function ReportEmployee() {
  const [mencionId, setMencionId] = useState<string>();
  const [regionId, setRegionId] = useState<number>(0);

  const [isPending, startTransition] = useTransition();
  const [reportListEmployee, setReportListEmployee] = useState<
    ApiResponse<EmployeeData[] | null>
  >({
    data: [],
    message: "",
    status: "",
  });
  const [stateId, setStateId] = useState<string>();
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
  const { data: patology, isLoading: isLoadingPatology } = useSWR(
    "patology",
    async () => await getPatologys(),
  );
  const { data: bloodGroup, isLoading: isLoadingBloodGroup } = useSWR(
    "blood",
    async () => await getBloodGroup(),
  );
  const { data: disability, isLoading: isLoadingDisability } = useSWR(
    "disability",
    async () => await getDisability(),
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

  const { data: academyLevel, isLoading: isLoadingAcademyLevel } = useSWR(
    "academyLevel",
    async () => await getAcademyLevel(),
  );
  const { data: carrera, isLoading: isLoadingCarrera } = useSWR(
    "carrera",
    async () => await getCarrera(),
  );
  const { data: mencion, isLoading: isLoadingMencion } = useSWR(
    mencionId ? ["mencion", mencionId] : null,
    async () => await getMencion(mencionId!),
  );
  const [municipalityId, setMunicipalityId] = useState<string>();
  const { data: region, isLoading: isLoadingRegion } = useSWR(
    "region",
    async () => await getRegion(),
  );
  const { data: states, isLoading: isLoadingStatesStates } = useSWR(
    regionId ? ["states", regionId] : null,
    async () => await getStateByRegion(regionId),
  );
  const { data: municipalitys, isLoading: isLoadingStatesSMunicipalitys } =
    useSWR(
      stateId ? ["municipalitys", stateId] : null,
      async () => await getMunicipalitys(stateId!),
    );
  const { data: parish, isLoading: isLoadingStatesParish } = useSWR(
    municipalityId ? ["parish", municipalityId] : null,
    async () => await getParish(municipalityId!),
  );
  const { data: reportEmployee, isLoading: isLoadingReportEmployee } = useSWR(
    "reportEmployee",
    async () => await getReportConfigEmployee(),
  );

  const {
    data: conditionDwelling,
    isLoading: isLoadingStatesConditionDwelling,
  } = useSWR("conditionDwelling", async () => await getConditionDwelling());
  const form = useForm({
    resolver: zodResolver(schemaReportEmployee),
    defaultValues: {
      categoria: "empleados",
      agrupar_por: "direccion_general",
      tipo_reporte: "lista",
      filtros: {
        dependencia_id: undefined,
        direccion_general_id: undefined,
        direccion_linea_id: undefined,
        coordinacion_id: undefined,
        sexo_id: undefined,
        discapacidad_id: undefined,
        grupo_sanguineo_id: undefined,
        patologia_id: undefined,
        nomina_id: undefined,
        grado_id: undefined,
        cargo_id: undefined,
        cargo_especifico_id: undefined,
        nivel_academico_id: undefined,
        carrera_id: undefined,
        mencion_id: undefined,
        apn_min: undefined,
        apn_max: undefined,
        edad_min: undefined,
        edad_max: undefined,
        fecha_ingreso_Desde: undefined,
        fecha_ingreso_Hasta: undefined,
        fecha_apn_Desde: undefined,
        fecha_apn_Hasta: undefined,
        region_id: undefined,
        estado_id: undefined,
        municipio_id: undefined,
        parroquia_id: undefined,
        condicion_vivienda_id: undefined,
      },
    },
  });
  if (!session) {
    return (
      <Loading promiseMessage="Validando Sesion Para Generar El Reporte"></Loading>
    );
  }
  const onSubmit = (data: SchemaReportEmployeeType) => {
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
        SchemaReportEmployeeType,
        EmployeeData[] | null
      >(payload);
      setReportListEmployee(reponse);
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
                              placeholder={`${isLoadingReportEmployee ? "Cargando Agrupaciones" : "Seleccione una Agrupacion"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reportEmployee?.data.agrupaciones.map(
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
                <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-violet-800">
                  <legend className="text-violet-900 font-semibold">
                    Informacion De Salud
                  </legend>
                  <FormField
                    control={form.control}
                    name="filtros.grupo_sanguineo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo Sanguineo </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingBloodGroup ? "Cargando Grupos Sanguineos" : "Seleccione un Grupo Sanguineo"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodGroup?.data.map((bloodGroup, i) => (
                              <SelectItem key={i} value={`${bloodGroup.id}`}>
                                {bloodGroup.GrupoSanguineo}
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
                    name={`filtros.patologia_id`}
                    render={({ field }) => (
                      <FormItem className=" cursor-pointer">
                        <FormLabel className="cursor-pointer">
                          Patologias{" "}
                        </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingPatology ? "Cargando Patologias" : "Seleccione una Patologias"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patology?.data.map((v, i) => (
                              <SelectItem value={`${v.id}`} key={i}>
                                {v.categoria.nombre_categoria} - {v.patologia}
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
                    name={`filtros.discapacidad_id`}
                    render={({ field }) => (
                      <FormItem className=" cursor-pointer">
                        <FormLabel className="cursor-pointer">
                          Discapacidad{" "}
                        </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingDisability ? "Cargando Discapacidades" : "Seleccione una Discapacidad"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {disability?.data.map((v, i) => (
                              <SelectItem value={`${v.id}`} key={i}>
                                {v.categoria.nombre_categoria} -{" "}
                                {v.discapacidad}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
                <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-blue-900">
                  <legend className="text-blue-900 font-semibold">
                    Informacion Academica
                  </legend>
                  <FormField
                    control={form.control}
                    name="filtros.nivel_academico_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivel Academico</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={` ${isLoadingAcademyLevel ? "Cargando Niveles Academicos" : "Seleccione un Nivel Academico"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academyLevel?.data.map((nivel, i) => (
                              <SelectItem key={i} value={`${nivel.id}`}>
                                {nivel.nivelacademico}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="flex flex-row gap-2 justify-end"></FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="filtros.carrera_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carrera </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                            setMencionId(values);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingCarrera ? "Cargando Carreras" : "Seleccione una carrera"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {carrera?.data.map((carrera, i) => (
                              <SelectItem key={i} value={`${carrera.id}`}>
                                {carrera.nombre_carrera}
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
                    name="filtros.mencion_id"
                    render={({ field }) => (
                      <FormItem className=" ">
                        <FormLabel>Mención </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingMencion ? "Cargando Menciones Academicas " : "Seleccione una mencion academica"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mencion?.data.map((mencion, i) => (
                              <SelectItem key={i} value={`${mencion.id}`}>
                                {mencion.nombre_mencion}
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
                <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-amber-700">
                  <legend className="text-amber-900 font-semibold">
                    Fechas De Ingresos/APN
                  </legend>
                  <FormField
                    control={form.control}
                    name="filtros.apn_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Años Minimos En La APN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingrese Un Año Minimo APN"
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
                    name="filtros.apn_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Años Maximos En La APN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ingrese Un Año Maximo APN"
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
                    name="filtros.fecha_ingreso_Desde"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel> Fecha De Ingreso Desde </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="font-light"
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              mode="single"
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date: Date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="filtros.fecha_ingreso_Hasta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel> Fecha De Ingreso Hasta </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="font-light"
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              mode="single"
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date: Date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="filtros.fecha_apn_Desde"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel> Fecha De APN Desde </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="font-light"
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              mode="single"
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date: Date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="filtros.fecha_apn_Hasta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel> Fecha De APN Hasta </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="font-light"
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              mode="single"
                              onSelect={(date) => field.onChange(date)}
                              disabled={(date: Date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
                <fieldset className="flex flex-col gap-3 border-2 p-2 rounded-sm border-emerald-800">
                  <legend className="text-emerald-800 font-semibold">
                    Direccion De Habitaciones
                  </legend>
                  <FormField
                    control={form.control}
                    name="filtros.region_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value));
                            setRegionId(Number.parseInt(value));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingRegion ? "Cargando Regiones" : "Seleccione una Region"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {region?.data.map((region, i) => (
                              <SelectItem key={i} value={`${region.id}`}>
                                {region.region}
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
                    name="filtros.estado_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value));
                            setStateId(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingStatesStates ? "Cargando Estados" : "Seleccione un Estado"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states?.data.map((state, i) => (
                              <SelectItem key={i} value={`${state.id}`}>
                                {state.estado}
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
                    name="filtros.municipio_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value));
                            setMunicipalityId(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingStatesSMunicipalitys ? "Cargando Municipios" : "Seleccione un Municpio"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {municipalitys?.data.map((municipality, i) => (
                              <SelectItem key={i} value={`${municipality.id}`}>
                                {municipality.municipio}
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
                    name="filtros.parroquia_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parroquia </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingStatesParish ? "Cargando Parroquias" : "Seleccione una Parroquia"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parish?.data.map((parish, i) => (
                              <SelectItem key={i} value={`${parish.id}`}>
                                {parish.parroquia}
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
                    name="filtros.condicion_vivienda_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condicion De Vivienda </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingStatesConditionDwelling ? "Cargando Condiciones De Vivienda" : "Seleccione una Condicion De Vivienda"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {conditionDwelling?.data.map(
                              (conditionDwelling, i) => (
                                <SelectItem
                                  key={i}
                                  value={`${conditionDwelling.id}`}
                                >
                                  {conditionDwelling.condicion}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              </div>
              <div className="border p-2  col-span-2 rounded-sm h-full">
                {reportListEmployee.data !== null &&
                reportListEmployee.data !== undefined &&
                reportListEmployee.data.length > 0 ? (
                  <div className="sticky top-0">
                    <TableEmployeeReport
                      employees={reportListEmployee.data}
                      className=""
                    />
                    <ExportButton
                      className="w-full cursor-pointer"
                      document={
                        <ReportPDFEmployee
                          id={session.user.cedula}
                          employeeData={reportListEmployee.data}
                        />
                      }
                      fileName="nomina.pdf"
                    />

                    <PDFView
                      document={
                        <ReportPDFEmployee
                          id={session.user.cedula}
                          employeeData={reportListEmployee.data}
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
