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
  getEmployeeInfo,
  getGrado,
  getNomina,
  getNominaEspecial,
  getOrganismosAds,
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
  EmployeeInfo,
  Grado,
  Nomina,
  OrganismosAds,
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
import { z } from "zod";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { schemaCodeEspecial } from "@/app/personal/asignar-codigo-especial/schema/schemaCodeEspecial";
import { AsignSpecialCode } from "@/app/personal/asignar-codigo-especial/actions/asign-special-code";
import { CircleAlert, Search } from "lucide-react";

interface CodigoCatalogFormProps {
  onSuccess?: (bool: boolean) => true | false;
}

export function CodigoCatalogEspecialForm({
  onSuccess,
}: CodigoCatalogFormProps) {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined
  );
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
    }
  );
  const [organismoAds, setOrganismoAds] = useState<
    ApiResponse<OrganismosAds[]>
  >({
    status: "",
    message: "",
    data: [],
  });
  const [employee, setEmployee] = useState<EmployeeInfo | []>();

  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeInfo(searchEmployee);
      setEmployee(getEmployee.data);
    }
  };
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
          organismoAds,
        ] = await Promise.all([
          getCargoEspecifico(),
          getCargo(),
          getNominaEspecial(),
          getGrado(),
          getDirectionGeneral(),
          getOrganismosAds(),
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
        if (Array.isArray(organismoAds.data)) {
          setOrganismoAds(organismoAds);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();
  }, []);
  useEffect(() => {
    if (!activeDirectionLine) form.setValue("DireccionLinea", 0);
    if (!activeCoordination) form.setValue("Coordinacion", 0);
  }, [activeCoordination, activeDirectionLine]);

  useEffect(() => {
    if (!Array.isArray(employee)) {
      if (employee?.cedulaidentidad) {
        form.setValue("employee", employee.cedulaidentidad);
      }
    }
  }, [employee]);
  const form = useForm({
    resolver: zodResolver(schemaCodeEspecial),
    defaultValues: {
      employee: "",
      OrganismoAdscritoid: 0,
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
  async function onSubmit(data: z.infer<typeof schemaCodeEspecial>) {
    startTransition(async () => {
      try {
        const response = await AsignSpecialCode(data, 3);
        if (response.success) {
          form.reset({
            employee: "",
            OrganismoAdscritoid: 0,
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
      } catch (error) {
        console.log(error);
      }
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Código de Posición</CardTitle>
        <CardDescription>
          Ingrese los datos del nuevo código y sus atributos asociados
        </CardDescription>
      </CardHeader>
      <CardContent>
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-3"
          >
            <div className="space-y-2 grid grid-cols-2 items-center gap-6 place-content-center">
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
                            placeholder={"Seleccione una Denominacion De Cargo"}
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
                    <FormLabel>Grado (Opcional)</FormLabel>
                    <Select
                      onValueChange={(values) => {
                        field.onChange(Number.parseInt(values));
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full truncate">
                          <SelectValue placeholder={"Seleccione un Grado"} />
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
                name="OrganismoAdscritoid"
                render={({ field }) => (
                  <FormItem className={`col-span-2`}>
                    <FormLabel>Organismo Adscrito (Opcional)</FormLabel>
                    <Select
                      onValueChange={(values) => {
                        field.onChange(Number.parseInt(values));
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full truncate">
                          <SelectValue
                            placeholder={"Seleccione Un Organismo Adscrito"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organismoAds.data.map((org, i) => (
                          <SelectItem key={i} value={`${org.id}`}>
                            {org.id}-{org.Organismoadscrito}
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
              {activeDirectionLine && (
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
                            <Switch onCheckedChange={setActiveCoordination} />
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              {activeCoordination && (
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
                                placeholder={"Seleccione una Coordinación"}
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
            </div>
            {employee && (
              <div
                className={` ${
                  !Array.isArray(employee) &&
                  "border-2 border-blue-400/45 bg-blue-200/40"
                }  rounded-sm p-2 `}
              >
                {!Array.isArray(employee) ? (
                  <>
                    <p>Nombres: {employee.nombres}</p>
                    <p>Apellidos: {employee.apellidos}</p>
                    <p>Cedula: {employee.cedulaidentidad}</p>
                    <p>Estado Civil: {employee.estadoCivil.estadoCivil}</p>
                    <p>
                      Ubicacion Geografia: {employee.estado.estado},{" "}
                      {employee.municipio.municipio},{" "}
                      {employee.parroquia.parroquia}
                    </p>
                    <p>Direccion Exacta: {employee.direccion_exacta}</p>
                  </>
                ) : (
                  <p>
                    <span className="flex gap-4">
                      Trabajador No Encontrado{" "}
                      <CircleAlert className="text-red-500" />
                    </span>
                  </p>
                )}
              </div>
            )}
            {/* Buttons */}
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
  );
}
