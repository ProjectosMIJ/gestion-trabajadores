"use client";
import { format, set } from "date-fns";
import { useState, useEffect, use, useTransition } from "react";
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
import { CalendarIcon, Check, Upload, X } from "lucide-react";
import { z } from "zod";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { schemaRac } from "@/app/personal/registrar/schemas/schemaRac";
import { registerEmployee } from "@/app/personal/registrar/actions/registerEmployeesActions";
import { toast } from "sonner";
import {
  AcademyLevel,
  ApiResponse,
  BloodGroupType,
  Cargo,
  DisabilitysType,
  Grado,
  MaritalStatusType,
  Municipality,
  Nomina,
  OrganismosAds,
  PantsSize,
  Parish,
  PatologysType,
  ShirtSize,
  ShoesSize,
  States,
  Status,
  UbicacionAdministrativa,
  UbicacionFisica,
} from "@/app/types/types";
import {
  getAcademyLevel,
  getBloodGroup,
  getCargo,
  getCargoEspecifico,
  getDisability,
  getGrado,
  getMaritalstatus,
  getNomina,
  getOrganismosAds,
  getPantsSize,
  getPatologys,
  getShirtSize,
  getShoesSize,
  getStates,
  getUbicacionAdministrativa,
  getUbicacionFisica,
} from "@/app/api/getInfoRac";
import { Checkbox } from "../ui/checkbox";
import MultipleSelector from "../multiSelect";
interface EmployeeRegistrationProps {
  onSuccess?: () => void;
}

export function EmployeeRegistration({ onSuccess }: EmployeeRegistrationProps) {
  const [step, setStep] = useState(1);
  const [maritalStatus, setMaritalStatus] = useState<
    ApiResponse<MaritalStatusType[]>
  >({
    status: "",
    message: "",
    data: [],
  });

  const [photoPreview, setPhotoPreview] = useState<string | null | undefined>(
    null
  );
  const [academyLevel, setAcademyLevel] = useState<ApiResponse<AcademyLevel[]>>(
    {
      status: "",
      message: "",
      data: [],
    }
  );
  const [disability, setDisability] = useState<ApiResponse<DisabilitysType[]>>({
    status: "",
    message: "",
    data: [],
  });
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
  const [patology, setPatology] = useState<ApiResponse<PatologysType[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [states, setStates] = useState<ApiResponse<States[]>>({
    status: "",
    message: "",
    data: [],
  });

  const [municipalitys, setMunicipalitys] = useState<
    ApiResponse<Municipality[]>
  >({
    status: "",
    message: "",
    data: [],
  });
  const [parish, setParish] = useState<ApiResponse<Parish[]>>({
    status: "",
    message: "",
    data: [],
  });

  const [status, setStatus] = useState<ApiResponse<Status[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    const loadData = async () => {
      const [
        academyLevel,
        states,
        disability,
        shirtSize,
        pantsSize,
        shoesSize,
        patology,
        bloodGroup,
        maritalStatus,
      ] = await Promise.all([
        getAcademyLevel(),
        getStates(),
        getDisability(),
        getShirtSize(),
        getPantsSize(),
        getShoesSize(),
        getPatologys(),
        getBloodGroup(),
        getMaritalstatus(),
      ]);

      setAcademyLevel(academyLevel);
      setShirtSize(shirtSize);
      setPantsSize(pantsSize);
      setShoesSize(shoesSize);
      setPatology(patology);
      setBloodGroup(bloodGroup);
      setStates(states);
      setStatus(status);
      setDisability(disability);
      setMaritalStatus(maritalStatus);
    };
    loadData();
  }, []);
  const form = useForm({
    resolver: zodResolver(schemaRac),
    defaultValues: {
      cedulaidentidad: "",
      nombres: "",
      apellidos: "",
      fecha_nacimiento: new Date(),
      file: null,
      fechaingresoorganismo: new Date(),
      fechaingresoapn: new Date(),
      n_contrato: "",
      vivienda: false,
      direccionExacta: "",
      sexoid: 0,
      discapacidad: 0,
      estadoCivil: 0,
      tallaCamisa: 0,
      tallaPantalon: 0,
      tallaZapatos: 0,
      nivelAcademico: 0,
      grupoSanguineo: 0,
      estadoid: 0,
      municipioid: 0,
      parroquiaid: 0,
      patologiaCronica: [],
    },
  });
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    form.setValue("file", null);
  };

  const getMunicipalitys = async (id: number) => {
    const responseMunicipalitys = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/municipios/${id}/`
    );
    const getMunicipalitys = await responseMunicipalitys.json();
    setMunicipalitys(getMunicipalitys);
  };

  const getParish = async (id: number) => {
    const responseParish = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/parroquias/${id}/`
    );
    const getParish = await responseParish.json();
    setParish(getParish);
  };
  const onSubmit = (data: z.infer<typeof schemaRac>) => {
    startTransition(async () => {
      const response = await registerEmployee(data, "5");
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Registrar Nuevo Trabajador</CardTitle>
        <CardDescription>
          Paso {step} de 2 - El código asignará automáticamente cargo y
          ubicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <FormField
                      control={form.control}
                      name="n_contrato"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numero de Contrato *</FormLabel>
                          <FormControl>
                            <Input placeholder="CTR-2024-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <Label>Foto del Trabajador</Label>
                    {photoPreview ? (
                      <div className="relative w-full h-40">
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <Button
                          onClick={handleRemovePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <FormField
                          control={form.control}
                          name="file"
                          render={({
                            field: { value, onChange, ...fieldProps },
                          }) => (
                            <FormItem className="w-full h-full text-center flex flex-col justify-center items-center">
                              <Upload className="h-8 w-8 text-gray-400" />
                              <FormLabel className="text-center p-1.5 bg-gray-300 text-black rounded-2xl animate-bounce cursor-pointer">
                                Haz clic aqui para seleccionar foto
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...fieldProps}
                                  type="file"
                                  accept=".pdf,.png,.jpeg,.jpg"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    onChange(file);
                                    if (file) {
                                      setPhotoPreview(
                                        URL.createObjectURL(file)
                                      );
                                    } else {
                                      setPhotoPreview("/placeholder.svg");
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                PNG, JPG hasta 5MB
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FormField
                        control={form.control}
                        name="cedulaidentidad"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cedula de identidad *</FormLabel>
                            <FormControl>
                              <Input placeholder="000000000" {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="sexoid"
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
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nombres"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Bernardo" {...field} />
                          </FormControl>
                          <FormDescription>
                            Este Nombre Sera Publico
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellidos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos *</FormLabel>
                          <FormControl>
                            <Input placeholder="Perez Gutierrez" {...field} />
                          </FormControl>
                          <FormDescription>
                            Este Apellido Sera Publico
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estadoCivil"
                      render={({ field }) => (
                        <FormItem className=" ">
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vivienda"
                      render={({ field }) => (
                        <FormItem className=" self-baseline">
                          <FormLabel
                            className={`bg-red-400 relative top-[21px] rounded-2xl ${
                              field.value ? "bg-blue-700" : "bg-white"
                            }  ${buttonVariants({
                              variant: `${
                                !field.value ? "outline" : "default"
                              }`,
                            })}`}
                          >
                            Posee Vivienda
                            {field.value ? (
                              <Check className="text-green-200"></Check>
                            ) : (
                              <X></X>
                            )}
                          </FormLabel>
                          <FormControl className="">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              defaultChecked={false}
                              className="hidden"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="discapacidad"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormLabel>Discapacidad (Opcional)</FormLabel>
                          <Select
                            onValueChange={(values) => {
                              field.onChange(Number.parseInt(values));
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue
                                  placeholder={"Seleccione una Discapacidad"}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {disability.data.map((disability, i) => (
                                <SelectItem key={i} value={`${disability.id}`}>
                                  {disability.discapacidad}
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
                      name="estadoid"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormLabel>Estado *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(Number.parseInt(value));
                              getMunicipalitys(Number.parseInt(value));
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue
                                  placeholder={"Seleccione un Estado"}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {states.data.map((state, i) => (
                                <SelectItem
                                  key={i}
                                  value={`${state.id}`}
                                  onClick={() => getMunicipalitys(state.id)}
                                >
                                  {state.estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Esta Informacion Sera Publica
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="municipioid"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormLabel>Municipio *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(Number.parseInt(value));
                              getParish(Number.parseInt(value));
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue
                                  placeholder={"Seleccione un Municpio"}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {municipalitys.data.map((municipality, i) => (
                                <SelectItem
                                  key={i}
                                  value={`${municipality.id}`}
                                >
                                  {municipality.municipio}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Esta Informacion Sera Publica
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parroquiaid"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormLabel>Parroquia *</FormLabel>
                          <Select
                            onValueChange={(values) => {
                              field.onChange(Number.parseInt(values));
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue
                                  placeholder={"Seleccione una Parroquia"}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {parish.data.map((parish, i) => (
                                <SelectItem key={i} value={`${parish.id}`}>
                                  {parish.parroquia}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Esta Informacion Sera Publica
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="direccionExacta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Direccion Detallada *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Calle Principal 123, Apartamento 4B, Entre calles 5 y 6"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Esto Sera Privado</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
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
                      name="fecha_nacimiento"
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
                                    format(field.value, "yyyy-MM-dd")
                                  ) : (
                                    <span>Selecciona una fecha</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
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
                      name="fechaingresoorganismo"
                      render={({ field }) => (
                        <FormItem className="flex flex-col  grow shrink basis-40">
                          <FormLabel>
                            {" "}
                            Fecha de Ingreso al Organismo *
                          </FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
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
                      name="fechaingresoapn"
                      render={({ field }) => (
                        <FormItem className="flex flex-col  grow shrink basis-40">
                          <FormLabel> Fecha de Ingreso al APN *</FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                onSelect={field.onChange}
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
                  </div>
                </div>
              ) : (
                <></>
              )}

              {/* Step 2: Additional Info */}
              {step === 2 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
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
                                  placeholder={
                                    "Seleccione una Talla De Pantalón"
                                  }
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
                                  placeholder={
                                    "Seleccione una Talla de Zapatos"
                                  }
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
                      name="grupoSanguineo"
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
                      name="patologiaCronica"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Patologia Cronica (Opcional)</FormLabel>
                          <MultipleSelector
                            options={patology.data.map((p) => ({
                              value: p.id.toString(),
                              label: p.patologia,
                            }))}
                            onChange={field.onChange}
                            placeholder="Seleccione patologías crónicas"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        Resumen del Registro
                      </h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p>
                          <strong>Trabajador:</strong> {form.watch("nombres")}{" "}
                          {form.watch("apellidos")}
                        </p>
                        <p>
                          <strong>Cédula:</strong>{" "}
                          {form.watch("cedulaidentidad")}
                        </p>
                        <p>
                          <strong>Ubicación:</strong>{" "}
                          {
                            states.data.find(
                              (state) => state.id === form.watch("estadoid")
                            )?.estado
                          }
                          ,{" "}
                          {
                            municipalitys.data.find(
                              (municipality) =>
                                municipality.id === form.watch("municipioid")
                            )?.municipio
                          }
                          ,{" "}
                          {
                            parish.data.find(
                              (parish) =>
                                parish.id === form.watch("parroquiaid")
                            )?.parroquia
                          }
                        </p>

                        <p>
                          <strong>Contrato:</strong> {form.watch("n_contrato")}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}

              <div className="flex gap-3 justify-end pt-4">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Anterior
                  </Button>
                )}
                {step < 2 ? (
                  <span
                    className={`cursor-pointer ${buttonVariants({
                      variant: "default",
                    })}`}
                    onClick={() => setStep(step + 1)}
                  >
                    Siguiente
                  </span>
                ) : (
                  <Button disabled={isPending}>
                    {isPending ? "Registrando..." : "Registrar Empleado"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
