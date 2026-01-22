"use client";
import {
  getCargo,
  getCargoEspecifico,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getEmployeeInfo,
  getGrado,
  getNominaEspecial,
  getOrganismosAds,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { AsignSpecialCode } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/asignar-codigo-especial/actions/asign-special-code";
import { schemaCodeEspecial } from "@/app/(protected)/dashboard/gestion-trabajadores/personal/asignar-codigo-especial/schema/schemaCodeEspecial";
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
} from "@/app/types/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import useSWR from "swr";

interface CodigoCatalogFormProps {
  onSuccess?: (bool: boolean) => true | false;
}

export function CodigoCatalogEspecialForm({
  onSuccess,
}: CodigoCatalogFormProps) {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );
  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<string>();
  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<string>();
  const [selecteIdCoordination, setSelecteIdCoordination] = useState<string>();
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

  const validateDirectionLine = () => {
    if (!activeDirectionLine) form.setValue("DireccionLinea", 0);
  };
  const validateCoordination = () => {
    if (!activeCoordination || !activeDirectionLine) {
      form.setValue("Coordinacion", 0);
    }
  };

  const { data: cargoEspecifico, isLoading: isLoadingCargoEspecifico } = useSWR(
    "cargoEspecifico",
    async () => await getCargoEspecifico(),
  );
  const { data: cargo, isLoading: isLoadingCargo } = useSWR("cargo", async () =>
    getCargo(),
  );
  const { data: nomina, isLoading: isLoadingNomina } = useSWR(
    "nomina",
    async () => getNominaEspecial(),
  );
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
  const { data: grado, isLoading: isLoadingGrado } = useSWR(
    "grado",
    async () => await getGrado(),
  );
  const { data: organismoAds, isLoading: isLoadingOrganismoAds } = useSWR(
    "organismoAds",
    async () => await getOrganismosAds(),
  );
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

  async function onSubmit(data: z.infer<typeof schemaCodeEspecial>) {
    startTransition(async () => {
      try {
        const response = await AsignSpecialCode(data);
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
      } catch {
        toast.error("Error Al Enviar la informacion");
      }
    });
  }
  const validateEmployee = () => {
    if (!Array.isArray(employee)) {
      if (employee?.cedulaidentidad) {
        form.setValue("employee", employee.cedulaidentidad);
      }
    }
  };
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
            <Button
              type="button"
              variant={"outline"}
              onClick={() => {
                loadEmployee();
                validateEmployee();
              }}
            >
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
                            placeholder={`${isLoadingCargo ? "Cargando Cargos" : "Seleccione una Denominacion De Cargo"}`}
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
                    <FormLabel>Grado (Opcional)</FormLabel>
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
                            placeholder={`${isLoadingGrado ? "Cargando Organismos Adscritos" : "Seleccione Un Organismo Adscrito"}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organismoAds?.data.map((org, i) => (
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
                        setSelecteIdDirectionLine(values);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full truncate">
                          <SelectValue
                            placeholder={`${isLoadingDirectionGeneral ? "Cargando Direccion Generales" : "Seleccione una Dirección General"}`}
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
                            setSelecteIdCoordination(values);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingDirectionLine ? "Cargando Direccioens De Linea" : "Seleccione una Dirección De Linea"}`}
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
