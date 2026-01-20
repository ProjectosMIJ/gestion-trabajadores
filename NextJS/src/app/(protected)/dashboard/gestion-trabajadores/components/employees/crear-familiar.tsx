"use client";

import {
  getAcademyLevel,
  getBloodGroup,
  getEmployeeInfo,
  getMaritalstatus,
  getPantsSize,
  getParent,
  getShirtSize,
  getShoesSize,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import createFamilyActions from "@/app/(protected)/dashboard/gestion-trabajadores/familiares/agregar-familiar/actions/create-family-actions";
import { schemaCreateFamily } from "@/app/(protected)/dashboard/gestion-trabajadores/familiares/agregar-familiar/schema/schemaCreateFamily";
import {
  AcademyLevel,
  ApiResponse,
  BloodGroupType,
  EmployeeInfo,
  MaritalStatusType,
  PantsSize,
  ParentType,
  ShirtSize,
  ShoesSize,
} from "@/app/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "date-fns";
import { CalendarIcon, CircleAlert, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../../../../../../components/ui/button";
import { Calendar } from "../../../../../../components/ui/calendar";
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
import { Input } from "../../../../../../components/ui/input";
import { Label } from "../../../../../../components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../../../components/ui/popover";
import { Switch } from "../../../../../../components/ui/switch";
import { Textarea } from "../../../../../../components/ui/textarea";
export function CreateFamilyForm() {
  const [searchEmployee, setSearchEmployee] = useState<string | undefined>(
    undefined,
  );

  const [employee, setEmployee] = useState<EmployeeInfo | []>();
  const [isPending, startTransition] = useTransition();
  const [academyLevel, setAcademyLevel] = useState<ApiResponse<AcademyLevel[]>>(
    {
      status: "",
      message: "",
      data: [],
    },
  );

  const [shirtSize, setShirtSize] = useState<ApiResponse<ShirtSize[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [pantsSize, setPantsSize] = useState<ApiResponse<PantsSize[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [shoesSize, setShoesSize] = useState<ApiResponse<ShoesSize[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [bloodGroup, setBloodGroup] = useState<ApiResponse<BloodGroupType[]>>({
    status: "",
    message: "",
    data: [],
  });

  const [maritalStatus, setMaritalStatus] = useState<
    ApiResponse<MaritalStatusType[]>
  >({
    status: "",
    message: "",
    data: [],
  });
  const [parent, setParent] = useState<ApiResponse<ParentType[]>>({
    status: "",
    message: "",
    data: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const [
        academyLevel,
        shirtSize,
        pantsSize,
        shoesSize,
        bloodGroup,
        maritalStatus,
        parent,
      ] = await Promise.all([
        getAcademyLevel(),
        getShirtSize(),
        getPantsSize(),
        getShoesSize(),
        getBloodGroup(),
        getMaritalstatus(),
        getParent(),
      ]);

      if (Array.isArray(academyLevel.data)) setAcademyLevel(academyLevel);
      if (Array.isArray(shirtSize.data)) setShirtSize(shirtSize);
      if (Array.isArray(pantsSize.data)) setPantsSize(pantsSize);
      if (Array.isArray(shoesSize.data)) setShoesSize(shoesSize);
      if (Array.isArray(bloodGroup.data)) setBloodGroup(bloodGroup);
      if (Array.isArray(maritalStatus.data)) setMaritalStatus(maritalStatus);
      if (Array.isArray(parent.data)) setParent(parent);
    };
    loadData();
  }, []);

  const form = useForm({
    resolver: zodResolver(schemaCreateFamily),
    defaultValues: {
      employeecedula: "",
      cedulaFamiliar: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      parentesco: 0,
      fechanacimiento: new Date(),
      nivelAcademico: 0,
      tallaCamisa: 0,
      mismo_ente: true,
      tallaPantalon: 0,
      tallaZapatos: 0,
      GrupoSanguineoid: 0,
      sexo: 0,
      patologiaCronica: [],
      discapacidad: 0,
      estadoCivil: 0,
      observaciones: "",
    },
  });
  const loadEmployee = async () => {
    if (searchEmployee) {
      const getEmployee = await getEmployeeInfo(searchEmployee);
      setEmployee(getEmployee.data);
    }
  };

  const onSubmit = (data: z.infer<typeof schemaCreateFamily>) => {
    startTransition(async () => {
      const response = await createFamilyActions(data, 5);
      if (response.success) {
        toast.success(response.message);
        setEmployee([]);
        form.reset({
          employeecedula: "",
          cedulaFamiliar: "",
          primer_nombre: "",
          segundo_nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          parentesco: 0,
          fechanacimiento: new Date(),
          nivelAcademico: 0,
          tallaCamisa: 0,
          mismo_ente: true,
          tallaPantalon: 0,
          tallaZapatos: 0,
          GrupoSanguineoid: 0,
          sexo: 0,
          patologiaCronica: [],
          discapacidad: 0,
          estadoCivil: 0,
          observaciones: "",
        });
      } else {
        toast.error(response.message);
      }
    });
  };

  const validateEmployee = () => {
    if (employee && !Array.isArray(employee)) {
      form.setValue("employeecedula", employee.cedulaidentidad);
    }
  };
  return (
    <>
      <Card>
        <CardContent className="space-y-5">
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
            {employee && !Array.isArray(employee) ? (
              <div className="rounded-sm p-2 border-2 border-green-500/25 bg-green-400/25">
                {" "}
                Empleado: {employee.nombres} {employee.cedulaidentidad}
              </div>
            ) : (
              <p>
                <span className="flex gap-4">
                  Trabajador No Encontrado{" "}
                  <CircleAlert className="text-red-500" />
                </span>
              </p>
            )}
          </div>
          {employee && !Array.isArray(employee) && (
            <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid grid-cols-2 gap-2"
                >
                  <FormField
                    control={form.control}
                    name="cedulaFamiliar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cedula *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0000000" />
                        </FormControl>
                        <FormDescription>
                          Opcional Si El Familiar Es Menor De Edad
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primer_nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Nombre *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Juan" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="segundo_nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Nombre *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jose" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primer_apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primer Apellido *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Hernandez" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="segundo_apellido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segundo Apellido *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Guzman" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentesco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parentesco *</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione un Parentesco"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parent.data.map((parent, i) => (
                              <SelectItem key={i} value={`${parent.id}`}>
                                {parent.descripcion_parentesco}
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
                    name="fechanacimiento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col  grow shrink basis-40">
                        <FormLabel> Fecha de Nacimiento *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="font-light"
                              >
                                {field.value ? (
                                  formatDate(field.value, "yyyy-MM-dd")
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
                    name="nivelAcademico"
                    render={({ field }) => (
                      <FormItem className=" ">
                        <FormLabel>Nivel Academico</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione un Nivel Academico"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academyLevel.data.map((nivel, i) => (
                              <SelectItem key={i} value={`${nivel.id}`}>
                                {nivel.nivelacademico}
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
                    name="tallaCamisa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talla De Camisa (Opcional)</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione una Talla De Camisa"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shirtSize.data.map((shirt, i) => (
                              <SelectItem key={i} value={`${shirt.id}`}>
                                {shirt.talla}
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
                    name="tallaPantalon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talla De Pantalón (Opcional)</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione una Talla De Pantalón"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pantsSize.data.map((pants, i) => (
                              <SelectItem key={i} value={`${pants.id}`}>
                                {pants.talla}
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
                    name="tallaZapatos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Talla De Zapatos</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione una Talla de Zapatos"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shoesSize.data.map((shoes, i) => (
                              <SelectItem key={i} value={`${shoes.id}`}>
                                {shoes.talla}
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
                    name="GrupoSanguineoid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo Sanguineo (Opcional)</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione un Grupo Sanguineo"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodGroup.data.map((bloodGroup, i) => (
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
                    name="sexo"
                    render={({ field }) => (
                      <FormItem className=" ">
                        <FormLabel>Sexo *</FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione un Genero"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Masculino</SelectItem>
                            <SelectItem value="2">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estadoCivil"
                    render={({ field }) => (
                      <FormItem className=" col-span-2 ">
                        <FormLabel>Estado Civil </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={"Seleccione Un Estado Civil"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatus.data.map((status, i) => (
                              <SelectItem key={i} value={`${status.id}`}>
                                {status.estadoCivil}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          <div className="w-full flex justify-end">
                            <Label>¿El Familar Trabaja En Este Ente?</Label>
                            <Switch
                              onCheckedChange={(boolean) => {
                                form.setValue("mismo_ente", boolean);
                              }}
                            />
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="observaciones"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Observaciones (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            id="observaciones"
                            placeholder="Describa las obsercaciones del familiar..."
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
                  <Button disabled={isPending} className="col-span-2">
                    Guardar Familiar
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
