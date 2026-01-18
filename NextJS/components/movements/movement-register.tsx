"use client";

import { useState, useEffect, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { Employee } from "@/lib/types/employee";

import {
  getCargo,
  getCargoEspecifico,
  getCodigo,
  getEmployeeById,
  getNomina,
  getStatus,
  getStatusEmployee,
  getStatusNomina,
} from "@/app/api/getInfoRac";
import {
  ApiResponse,
  Cargo,
  Code,
  ErrorFetch,
  Nomina,
  Status,
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
import { formatDate, set } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaMove } from "@/app/movimientos/schemas/schemaMoves";
import { createMoveActions } from "@/app/movimientos/actions/createMoves";
import z from "zod";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { Description } from "@radix-ui/react-toast";

export function MovementRegister() {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployeeActive, setSelectedEmployeeActive] =
    useState<boolean>(false);

  const [selectedEmployee, setSelectedEmployee] = useState<
    ApiResponse<Employee>
  >({
    status: "",
    message: "",
    data: {
      cedulaidentidad: "",
      nombres: "",
      apellidos: "",
      sexo: "",
      nivel_academico: "",
      estado: "",
      municipio: "",
      parroquia: "",
      direccion_exacta: "",
      fecha_nacimiento: "",
      fechaingresoorganismo: "",
      fechaingresoapn: "",
      fecha_actualizacion: "",
      profile: "",
      n_contrato: "",
      asignaciones: [
        {
          codigo: "",
          denominacion_cargo: "",
          denominacion_cargo_especifico: "",
          estatus: "",
          tipo_nomina: "",
          OrganismoAdscrito: "",
          ubicacion_administrativa: "",
          ubicacion_fisica: "",
          observaciones: "",
          grado: "",
        },
      ],
    },
  });
  const [codigoCatalog, setCodigoCatalog] = useState<Code[] | ErrorFetch>([]);
  const [selectedCodigoNew, setSelectedCodigoNew] = useState<Code | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [changeCode, setChangeCode] = useState<boolean>(false);
  const [changeStatus, setChangeStatus] = useState<boolean>(false);
  const [config, setConfig] = useState<boolean>(false);

  const [statusEmployee, setStatusEmployee] = useState<ApiResponse<Status[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [estatus, setStatus] = useState<ApiResponse<Status[]>>({
    status: "",
    message: "",
    data: [],
  });
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
  async function loadCodigoCatalog() {
    const code = await getCodigo();
    setCodigoCatalog(code.data);
  }
  async function loadData() {
    try {
      const [statusEmployee, cargoSpecify, cargo, nomina, estatus] =
        await Promise.all([
          getStatusEmployee(),
          getCargoEspecifico(),
          getCargo(),
          getNomina(),
          getStatusNomina(),
        ]);
      setStatusEmployee(statusEmployee);
      setCargoEspecifico(cargoSpecify);
      setCargo(cargo);
      setNomina(nomina);
      setStatus(estatus);
    } catch {
      setError("Error al cargar datos");
    }
  }
  useEffect(() => {
    const load = async () => {
      await Promise.all([loadData(), loadCodigoCatalog()]);
    };
    load();

    setSelectedEmployeeActive(false);
    setSelectedCodigoNew(null);
  }, [isPending]);

  async function handleSearchEmployee() {
    if (!employeeSearch.trim()) {
      setError("Ingrese una cédula válida");
      return;
    }
    try {
      setError("");
      const employee = await getEmployeeById(employeeSearch);
      if (employee.data.asignaciones) {
        setSelectedEmployee(employee);
        setSelectedEmployeeActive(true);
      } else {
        setError("Empleado no encontrado");
        setSelectedEmployee((prev) => {
          return { ...prev };
        });
      }
    } catch {
      setError("Error al buscar empleado");
    }
  }
  const cargoActive = selectedEmployee.data.asignaciones.filter(
    (codigo) => codigo.estatus
  );
  function handleCodigoSelect(codigoValue: string) {
    if (Array.isArray(codigoCatalog)) {
      const selected = codigoCatalog.find((c) => c.codigo === codigoValue);
      if (selected) {
        setSelectedCodigoNew(selected);
      }
    }
  }
  const form = useForm({
    resolver: zodResolver(schemaMove),
    defaultValues: {
      codigo_nuevo: "",
      observaciones: "",
      codigo_actual: "0",
      modificado_por_id: 4,
      estatus: 4,
      new_denominacioncargoespecificoid: 0,
      new_denominacioncargoid: 0,
      new_tiponominaid: 0,
      isCode: false,
    },
  });
  async function handleRegisterMovement(values: z.infer<typeof schemaMove>) {
    startTransition(async () => {
      const response = await createMoveActions(
        values,
        selectedEmployee.data.cedulaidentidad,
        config
      );
      if (response.success) {
        form.reset();
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  }
  useEffect(() => {
    if (changeCode) {
      setChangeStatus(false);
    }
    if (changeStatus) {
      setChangeCode(false);
    }
    form.setValue("isCode", changeCode);
  }, [changeCode, changeStatus]);
  console.log(codigoCatalog);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Movimiento de Código</CardTitle>
        <CardDescription>
          Busque empleado y asigne un nuevo código que actualizará su cargo y
          ubicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="employee-search">
              Búsqueda de Empleado (Cédula)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="employee-search"
                placeholder="Ingresar cédula..."
                value={employeeSearch}
                onChange={(e) => {
                  if (isPending) {
                    setEmployeeSearch("");
                    return;
                  }
                  return setEmployeeSearch(e.target.value);
                }}
              />

              <Button
                onClick={handleSearchEmployee}
                variant="outline"
                size="icon"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-700 mt-0.5">
              Vuelva a presionar busqueda en caso si es el mismo Empleado
            </p>
          </div>

          {selectedEmployeeActive && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-900">Empleado:</p>
              <p className="text-lg font-semibold text-blue-900">
                {selectedEmployee.data.nombres}{" "}
                {selectedEmployee.data.apellidos}
              </p>
              <div className="space-y-1 text-sm text-blue-800">
                <p>
                  <strong>Códigos Actuales:</strong>{" "}
                  {selectedEmployee.data.asignaciones
                    .map((codigo) => codigo.codigo)
                    .join(" / ")}
                </p>
                <p>
                  <strong>Cargos Actuals:</strong>{" "}
                  {cargoActive
                    .map(
                      (codigo) =>
                        `${codigo.denominacion_cargo}: ${codigo.codigo}`
                    )
                    .join(" / ")}
                </p>
                <p>
                  <strong>Ubicaciones Actuales:</strong>{" "}
                  {cargoActive
                    .map((codigo) => `${codigo.ubicacion_fisica} `)
                    .join(" / ")}
                </p>
              </div>
            </div>
          )}

          {selectedEmployee && (
            <div className="space-y-4">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleRegisterMovement)}
                  className="space-y-2"
                >
                  <div className="grid grid-cols-2 gap-4 select-none">
                    <Button
                      onClick={() => {
                        setChangeCode((prev) => !prev);
                      }}
                      className={`w-full cursor-pointer  ${buttonVariants({
                        variant: `${changeCode ? "ghost" : "default"}`,
                      })}`}
                      disabled={changeCode}
                      type="button"
                    >
                      Cambiar Codigo
                    </Button>

                    <Button
                      className={`w-full cursor-pointer ${buttonVariants({
                        variant: `${changeStatus ? "ghost" : "default"}`,
                      })}`}
                      type="button"
                      onClick={() => {
                        setChangeStatus((prev) => !prev);
                      }}
                      disabled={changeStatus}
                    >
                      Gestionar Personal
                    </Button>
                  </div>
                  {changeCode && (
                    <>
                      <div className="flex items-center space-x-2 justify-end m-5">
                        <Switch
                          id="config"
                          checked={config}
                          onCheckedChange={setConfig}
                        />
                        <Label htmlFor="config">Cambiar Estatus De Cargo</Label>
                      </div>
                      <FormField
                        control={form.control}
                        name="codigo_actual"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Seleccione el Codigo Del Empleado a{" "}
                              {!config ? "Reemplazar" : "Actualizar"}
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue
                                    placeholder={
                                      "Buscar código a reemplazar..."
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">
                                  Seleccione un codigo
                                </SelectItem>
                                {selectedEmployee.data.asignaciones.map(
                                  (codePresent) => (
                                    <SelectItem
                                      key={Math.random()}
                                      value={codePresent.codigo || "VACIO"}
                                    >
                                      {codePresent.codigo
                                        ? `${codePresent.codigo} -
                                  ${codePresent.denominacion_cargo_especifico}`
                                        : "VACIO"}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {config === false && (
                        <>
                          <FormField
                            control={form.control}
                            name="codigo_nuevo"
                            render={({ field }) => (
                              <FormItem className=" ">
                                <FormLabel>Nuevo Código *</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleCodigoSelect(value);
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={`${
                                          Array.isArray(codigoCatalog)
                                            ? "Buscar código..."
                                            : "No hay Codigos Vacantes"
                                        }`}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Array.isArray(codigoCatalog)
                                      ? codigoCatalog.map((codigo) => (
                                          <SelectItem
                                            key={Math.random()}
                                            value={codigo.codigo}
                                          >
                                            {codigo.codigo} -{" "}
                                            {
                                              codigo.denominacion_cargo_especifico
                                            }
                                          </SelectItem>
                                        ))
                                      : ""}
                                  </SelectContent>
                                </Select>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      {config && (
                        <>
                          <FormField
                            control={form.control}
                            name="estatus"
                            render={({ field }) => (
                              <FormItem className=" ">
                                <FormLabel>Estatus *</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(Number.parseInt(value));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue
                                        placeholder={"Buscar estatus..."}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {estatus.data.map((estatu) => (
                                      <SelectItem
                                        key={Math.random()}
                                        value={estatu.id.toString()}
                                      >
                                        {estatu.estatus}
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
                  {changeStatus && (
                    <div className="space-y-2 grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="estatus"
                        render={({ field }) => (
                          <FormItem
                            className={`${
                              form.watch("estatus") === 4 ? "col-span-2" : ""
                            }`}
                          >
                            <FormLabel>Seleccione el Estatus</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(Number.parseInt(value));
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className={`w-full truncate `}>
                                  <SelectValue
                                    placeholder={
                                      "Buscar el estatus a otorgar..."
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusEmployee.data.map((status) => (
                                  <SelectItem
                                    key={Math.random()}
                                    value={status.id.toString()}
                                  >
                                    {status.estatus}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch("estatus") === 5 && changeStatus && (
                        <>
                          <FormField
                            control={form.control}
                            name="new_denominacioncargoespecificoid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Seleccione el cargo especifico
                                </FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(Number.parseInt(value));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={
                                          "Buscar el cargo especifico..."
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {cargoEspecifico.data.map((cargo) => (
                                      <SelectItem
                                        key={Math.random()}
                                        value={cargo.id.toString()}
                                      >
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
                            name="new_denominacioncargoid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Seleccione el Cargo</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(Number.parseInt(value));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={"Buscar el cargo..."}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {cargo.data.map((cargo) => (
                                      <SelectItem
                                        key={Math.random()}
                                        value={cargo.id.toString()}
                                      >
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
                            name="new_tiponominaid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Seleccione el tipo de nomina
                                </FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(Number.parseInt(value));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={"Buscar la nomina..."}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {nomina.data.map((nomina) => (
                                      <SelectItem
                                        key={Math.random()}
                                        value={nomina.id.toString()}
                                      >
                                        {nomina.nomina}
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
                  )}
                  {(changeCode || changeStatus) && (
                    <>
                      <FormField
                        control={form.control}
                        name="observaciones"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Motivo del{" "}
                              {changeCode ? "Movimiento" : "Cambio De Estatus"}*
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                id="observaciones"
                                placeholder="Describa el motivo del cambio de código..."
                                value={field.value}
                                onChange={field.onChange}
                                className="mt-1"
                                rows={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {selectedCodigoNew && changeCode && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-xl font-semibold text-green-700 mb-2 text-center">
                        Nuevos Valores:
                      </p>
                      <div className="space-y-1 text-sm text-green-700 grid grid-cols-2">
                        <p className="flex flex-col gap-0.5">
                          <strong>Código:</strong> {selectedCodigoNew.codigo}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Cargo:</strong>{" "}
                          {selectedCodigoNew.denominacion_cargo}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Cargo Especico:</strong>{" "}
                          {selectedCodigoNew.denominacion_cargo_especifico}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Ubicación Administrativa:</strong>{" "}
                          {selectedCodigoNew.ubicacion_administrativa}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Ubicación:</strong>{" "}
                          {selectedCodigoNew.ubicacion_fisica}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Grado:</strong> {selectedCodigoNew.grado}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Organismo Adscrito:</strong>{" "}
                          {selectedCodigoNew.OrganismoAdscrito}
                        </p>
                        <p className="flex flex-col gap-0.5">
                          <strong>Nómina:</strong>{" "}
                          {selectedCodigoNew.tipo_nomina}
                        </p>
                        <p className="flex flex-col gap-0.5 col-span-2 m-auto text-center">
                          <strong>Ultima Fecha de Actualizacion:</strong>{" "}
                          {formatDate(
                            selectedCodigoNew.fecha_actualizacion,
                            "dd-mm-yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={`w-full ${isPending && "cursor-progress"}`}
                  >
                    {isPending ? (
                      <>
                        <Spinner />
                        Creando Nuevo Codigo...
                      </>
                    ) : (
                      "Registrar Movimiento"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
