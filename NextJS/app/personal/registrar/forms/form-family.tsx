import { zodResolver } from "@hookform/resolvers/zod";
import {
  FamilyEmployeeType,
  schemaFamilyFormity,
} from "../schemas/schema-family_employee";
import { useFieldArray, useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import {
  BookAIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Contact,
  Database,
  HeartPulse,
  Loader2Icon,
  Plus,
  Shirt,
  Trash,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getAcademyLevel,
  getBloodGroup,
  getCarrera,
  getDisability,
  getMaritalstatus,
  getMencion,
  getPantsSize,
  getParent,
  getPatologys,
  getShirtSize,
  getShoesSize,
} from "@/app/api/getInfoRac";
import {
  AcademyLevel,
  ApiResponse,
  BloodGroupType,
  Carrera,
  DisabilitysType,
  MaritalStatusType,
  Mencion,
  PantsSize,
  ParentType,
  PatologysType,
  ShirtSize,
  ShoesSize,
} from "@/app/types/types";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  onSubmit: (values: FamilyEmployeeType) => void;
  defaultValues: FamilyEmployeeType;
};

export function FormFamilyEmployee({ onSubmit, defaultValues }: Props) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [down, setDown] = useState(false);
  const [academyLevel, setAcademyLevel] = useState<ApiResponse<AcademyLevel[]>>(
    {
      status: "",
      message: "",
      data: [],
    },
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

  const [carrera, setCarrera] = useState<ApiResponse<Carrera[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [mencion, setMencion] = useState<ApiResponse<Mencion[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [reload, setReload] = useState(false);
  const [patologyGroupList, setPatologyGroupList] = useState<
    { categoria: string; datos: PatologysType[] }[]
  >([]);
  const [disabilityGroupList, setDisabilityGroupList] = useState<
    { categoria: string; datos: DisabilitysType[] }[]
  >([]);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [shirtSize, pantsSize, shoesSize, parent, carrera] =
          await Promise.all([
            getShirtSize(),
            getPantsSize(),
            getShoesSize(),
            getParent(),
            getCarrera(),
          ]);

        if (Array.isArray(shirtSize.data)) setShirtSize(shirtSize);
        if (Array.isArray(pantsSize.data)) setPantsSize(pantsSize);
        if (Array.isArray(shoesSize.data)) setShoesSize(shoesSize);
        if (Array.isArray(patology.data)) setPatology(patology);
        if (Array.isArray(disability.data)) setDisability(disability);
        if (Array.isArray(parent.data)) setParent(parent);
        if (Array.isArray(carrera.data)) setCarrera(carrera);
      } catch {
        setReload(false);
      } finally {
        setReload(false);
      }
    };
    loadData();
  }, [reload]);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [academyLevel, bloodGroup, maritalStatus, disability, patology] =
          await Promise.all([
            getAcademyLevel(),
            getBloodGroup(),

            getMaritalstatus(),
            getDisability(),

            getPatologys(),
          ]);
        if (Array.isArray(patology.data)) setPatology(patology);
        if (Array.isArray(academyLevel.data)) setAcademyLevel(academyLevel);
        if (Array.isArray(bloodGroup.data)) setBloodGroup(bloodGroup);

        if (Array.isArray(disability.data)) setDisability(disability);

        setMaritalStatus(maritalStatus);
        const patologyGroupList = patology.data.reduce(
          (acc, item) => {
            const categoriaNombre = item.categoria.nombre_categoria;
            let grupo = acc.find((g) => g.categoria === categoriaNombre);
            if (!grupo) {
              grupo = { categoria: categoriaNombre, datos: [] };
              acc.push(grupo);
            }
            grupo.datos.push(item);
            return acc;
          },
          [] as { categoria: string; datos: PatologysType[] }[],
        );
        setPatologyGroupList(patologyGroupList);
        const disabilityGroupList = disability.data.reduce(
          (acc, item) => {
            const categoriaNombre = item.categoria.nombre_categoria;
            let grupo = acc.find((g) => g.categoria === categoriaNombre);
            if (!grupo) {
              grupo = { categoria: categoriaNombre, datos: [] };
              acc.push(grupo);
            }
            grupo.datos.push(item);
            return acc;
          },
          [] as { categoria: string; datos: DisabilitysType[] }[],
        );
        setDisabilityGroupList(disabilityGroupList);
      } catch {
        setReload(false);
      } finally {
        setReload(false);
      }
    };
    loadData();
  }, [reload]);

  const form = useForm({
    defaultValues,
    resolver: zodResolver(schemaFamilyFormity),
    mode: "onSubmit",
  });
  const getMentions = async (id: string) => {
    const responseMentions = await getMencion(id);
    if (Array.isArray(responseMentions.data)) setMencion(responseMentions);
  };
  const onSubmitFormity = (data: FamilyEmployeeType) => {
    onSubmit(data);
  };
  const { append, remove, fields } = useFieldArray({
    name: "familys",
    control: form.control,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacion De Familiares (Opcional si no posee)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitFormity)}>
            <fieldset className="p-3 " dir="rtl">
              <legend className="text-lg font-semibold">
                <div className="flex justify-end gap-2 mb-4">
                  <div>
                    <Button
                      variant={"outline"}
                      className="cursor-pointer bg-red-500 hover:bg-red-700 hover:border-2 hover:border-red-600 text-white"
                      type="button"
                      onClick={() => {
                        if (fields.length > 0) {
                          remove(fields.map((field, index) => index));
                        }
                      }}
                    >
                      Limpiar
                      <Trash />
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant={"outline"}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-700 hover:border-2 hover:border-blue-600 text-white"
                      type="button"
                      onClick={() => setReload(true)}
                    >
                      Recargar Datos
                      {!reload ? <Loader2Icon /> : <Spinner />}
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant={"outline"}
                      className="cursor-pointer bg-green-500 hover:bg-green-700 hover:border-2 hover:border-green-600 text-white"
                      type="button"
                      onClick={() => {
                        append({
                          cedulaFamiliar: undefined,
                          estadoCivil: 0,
                          fechanacimiento: new Date(),
                          heredero: false,
                          mismo_ente: false,
                          observaciones: undefined,
                          parentesco: 0,
                          perfil_fisico_familiar: {
                            tallaCamisa: 0,
                            tallaPantalon: 0,
                            tallaZapatos: 0,
                          },
                          perfil_salud_familiar: {
                            grupoSanguineo: 0,
                            discapacidad: [],
                            patologiaCronica: [],
                          },
                          primer_apellido: "",
                          primer_nombre: "",
                          segundo_apellido: "",
                          segundo_nombre: "",
                          sexo: 0,
                          formacion_academica_familiar: {
                            capacitacion: "",
                            carrera_id: 0,
                            institucion: "",
                            mencion_id: undefined,
                            nivel_Academico_id: 0,
                          },
                        });
                        setExpandedIndex(fields.length);
                      }}
                    >
                      Agregar Familiar
                      <Plus />
                    </Button>
                  </div>
                </div>
              </legend>
              <div dir="ltr">
                {fields.map((field, index) => {
                  const isExpanded = index === expandedIndex;
                  const values = form.getValues(`familys.${index}`);
                  return (
                    <>
                      <div
                        className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${!isExpanded ? "bg-white" : "bg-slate-100 border-b"}`}
                        onClick={() =>
                          setExpandedIndex(isExpanded ? -1 : index)
                        }
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-500">
                            #{index + 1}
                          </span>
                          {!isExpanded ? (
                            <div className="flex gap-2 text-sm text-gray-600">
                              <p>
                                <strong>Nombre:</strong>{" "}
                                {values?.primer_nombre || "---"}{" "}
                                {values?.primer_apellido || ""}
                              </p>
                              <p>
                                <strong>Parentesco:</strong>{" "}
                                {values?.parentesco || "Sin asignar"}
                              </p>
                            </div>
                          ) : (
                            <span className="font-semibold text-blue-600">
                              Editando Familiar
                            </span>
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp /> : <ChevronDown />}
                        </Button>
                      </div>

                      {/* Contenido del formulario - SOLO se muestra cuando está expandido */}
                      <div className={`p-4 ${isExpanded ? "block" : "hidden"}`}>
                        <div className="grid grid-cols-2 gap-2 space-y-4">
                          {/* Botones de acción */}
                          <div className="col-span-2 flex gap-2 justify-end mb-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setExpandedIndex(-1)}
                            >
                              Cerrar edición
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => remove(index)}
                            >
                              Eliminar Familiar
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`grid grid-cols-2 gap-2 space-y-4 ${isExpanded ? "" : "hidden"}`}
                        key={field.id}
                      >
                        <fieldset className="border grid grid-cols-2 gap-2 space-y-4 col-span-2 p-2">
                          <legend className="flex gap-2">
                            Datos Personales <Database />
                          </legend>
                          <FormField
                            control={form.control}
                            name={`familys.${index}.cedulaFamiliar`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel className="cursor-pointer">
                                  Cedula Familiar
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    {...field}
                                    disabled={down}
                                    placeholder={`${down ? "Se tomara la cedula del trabajador como representante del menor de edad" : ""}`}
                                  />
                                </FormControl>
                                <FormDescription>
                                  <Label className="flex justify-end cursor-pointer">
                                    ¿El Familiar Es Menor De 9 años?{" "}
                                    <Switch
                                      className="cursor-pointer"
                                      onCheckedChange={(bool) => {
                                        setDown(bool);
                                        field.onChange(down ? "" : undefined);
                                      }}
                                    />
                                  </Label>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`familys.${index}.primer_nombre`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="cursor-pointer">
                                  Primer Nombre
                                </FormLabel>
                                <FormControl>
                                  <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`familys.${index}.segundo_nombre`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="cursor-pointer">
                                  Segundo Nombre
                                </FormLabel>
                                <FormControl>
                                  <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`familys.${index}.primer_apellido`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="cursor-pointer">
                                  Primer Apellido
                                </FormLabel>
                                <FormControl>
                                  <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`familys.${index}.segundo_apellido`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="cursor-pointer">
                                  Segundo Apellido
                                </FormLabel>
                                <FormControl>
                                  <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`familys.${index}.sexo`}
                            render={({ field }) => (
                              <FormItem className=" cursor-pointer">
                                <FormLabel className="cursor-pointer">
                                  Sexo *
                                </FormLabel>
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
                            name={`familys.${index}.fechanacimiento`}
                            render={({ field }) => (
                              <FormItem className="flex flex-col  grow shrink basis-40 cursor-pointer">
                                <FormLabel className="cursor-pointer">
                                  {" "}
                                  Fecha de Nacimiento *
                                </FormLabel>
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
                            name={`familys.${index}.estadoCivil`}
                            render={({ field }) => (
                              <FormItem className="cursor-pointer col-span-2 w-full">
                                <FormLabel className="cursor-pointer ">
                                  Estado Civil{" "}
                                </FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={
                                          "Seleccione Un Estado Civil"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {maritalStatus.data.map((status, i) => (
                                      <SelectItem
                                        key={i}
                                        value={`${status.id}`}
                                      >
                                        {status.estadoCivil}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </fieldset>
                        <fieldset className="border grid grid-cols-2 gap-2 space-y-4 col-span-2 p-2">
                          <legend className="flex gap-2">
                            {" "}
                            Relacion Y Parentesco <Contact />{" "}
                          </legend>
                          <FormField
                            control={form.control}
                            name={`familys.${index}.parentesco`}
                            render={({ field }) => (
                              <FormItem className="cursor-pointer">
                                <FormLabel className="cursor-pointer">
                                  Parentesco *
                                </FormLabel>
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
                                      <SelectItem
                                        key={i}
                                        value={`${parent.id}`}
                                      >
                                        {parent.descripcion_parentesco}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {form.watch(`familys.${index}.parentesco`) ==
                            parent.data.find(
                              (v) => v.descripcion_parentesco === "HIJO (A)",
                            )?.id && (
                            <>
                              <FormField
                                control={form.control}
                                name={`familys.${index}.orden_hijo`}
                                render={({ field }) => (
                                  <FormItem className="cursor-pointer">
                                    <FormLabel className="cursor-pointer">
                                      Orden de nacimiento
                                    </FormLabel>
                                    <Select
                                      onValueChange={(values) => {
                                        field.onChange(Number.parseInt(values));
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full truncate">
                                          <SelectValue
                                            placeholder={
                                              "Seleccione Un Orden De Nacimiento"
                                            }
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                        <SelectItem value="4">4</SelectItem>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="6">6</SelectItem>
                                        <SelectItem value="7">7</SelectItem>
                                        <SelectItem value="8">8</SelectItem>
                                        <SelectItem value="9">9</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="11">11</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="13">13</SelectItem>
                                        <SelectItem value="14">14</SelectItem>
                                        <SelectItem value="15">15</SelectItem>
                                        <SelectItem value="16">16</SelectItem>
                                        <SelectItem value="17">17</SelectItem>
                                        <SelectItem value="18">18</SelectItem>
                                        <SelectItem value="19">19</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="21">21</SelectItem>
                                        <SelectItem value="22">22</SelectItem>
                                        <SelectItem value="23">23</SelectItem>
                                        <SelectItem value="24">24</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="26">26</SelectItem>
                                        <SelectItem value="27">27</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </>
                          )}

                          <FormField
                            name={`familys.${index}.mismo_ente`}
                            control={form.control}
                            render={({ field }) => (
                              <>
                                <FormItem className="flex flex-row items-center  m-auto">
                                  <Label
                                    htmlFor="work"
                                    className="text-center cursor-pointer"
                                  >
                                    ¿El Familar Trabaja En Este Ente?
                                  </Label>
                                  <Switch
                                    id="work"
                                    onCheckedChange={field.onChange}
                                    className="scale-100 cursor-pointer"
                                  />
                                </FormItem>
                                <FormMessage />
                              </>
                            )}
                          />

                          <FormField
                            name={`familys.${index}.heredero`}
                            control={form.control}
                            render={({ field }) => (
                              <>
                                <FormItem className="flex flex-row items-center  m-auto">
                                  <Label
                                    htmlFor="soon"
                                    className="cursor-pointer"
                                  >
                                    ¿El Familiar Es Heredero?
                                  </Label>
                                  <Switch
                                    id="soon"
                                    onCheckedChange={field.onChange}
                                    className="scale-100 cursor-pointer"
                                  />
                                </FormItem>
                                <FormMessage />
                              </>
                            )}
                          />
                        </fieldset>
                        <fieldset className="border grid grid-cols-2 gap-2 space-y-4 col-span-2 p-2">
                          <legend className="flex gap-2">
                            Información Academica <BookAIcon />
                          </legend>
                          <FormField
                            control={form.control}
                            name={`familys.${index}.formacion_academica_familiar.nivel_Academico_id`}
                            render={({ field }) => (
                              <FormItem className="col-span-2 cursor-pointer">
                                <FormLabel className="cursor-pointer">
                                  Nivel Academico
                                </FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={
                                          "Seleccione un Nivel Academico"
                                        }
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
                                <FormDescription className="flex flex-row gap-2 justify-end">
                                  <Label htmlFor="showInfo">
                                    Mas Detalles De Formacion Academica
                                  </Label>
                                  <Switch
                                    className="cursor-pointer"
                                    id="showInfo"
                                    onCheckedChange={setShowMoreDetails}
                                  />
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {showMoreDetails && (
                            <>
                              <FormField
                                name={`familys.${index}.formacion_academica_familiar.institucion`}
                                control={form.control}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="cursor-pointer">
                                      Institucion (Opcional)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Universidad Nacional..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                name={`familys.${index}.formacion_academica_familiar.capacitacion`}
                                control={form.control}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="cursor-pointer">
                                      Capacitacion (Opcional)
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        placeholder="Capacitado En..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`familys.${index}.formacion_academica_familiar.carrera_id`}
                                render={({ field }) => (
                                  <FormItem className="cursor-pointer ">
                                    <FormLabel className="cursor-pointer">
                                      Carrera (Opcional)
                                    </FormLabel>
                                    <Select
                                      onValueChange={(values) => {
                                        field.onChange(Number.parseInt(values));
                                        getMentions(values);
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full truncate">
                                          <SelectValue
                                            placeholder={
                                              "Seleccione una carrera"
                                            }
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {carrera.data.map((carrera, i) => (
                                          <SelectItem
                                            key={i}
                                            value={`${carrera.id}`}
                                          >
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
                                name={`familys.${index}.formacion_academica_familiar.mencion_id`}
                                render={({ field }) => (
                                  <FormItem className=" cursor-pointer">
                                    <FormLabel className="cursor-pointer">
                                      Mención (Opcional)
                                    </FormLabel>
                                    <Select
                                      onValueChange={(values) => {
                                        field.onChange(Number.parseInt(values));
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full truncate">
                                          <SelectValue
                                            placeholder={
                                              "Seleccione una mencion academica"
                                            }
                                          />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {mencion.data.map((mencion, i) => (
                                          <SelectItem
                                            key={i}
                                            value={`${mencion.id}`}
                                          >
                                            {mencion.nombre_mencion}
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
                        </fieldset>
                        <fieldset className="border grid grid-cols-2 gap-2 space-y-4 col-span-2 p-2">
                          <legend className="flex flex-row gap-2">
                            Informacion de Vestimenta <Shirt />
                          </legend>

                          <FormField
                            control={form.control}
                            name={`familys.${index}.perfil_fisico_familiar.tallaCamisa`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Talla De Camisa</FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={
                                          "Seleccione una Talla De Camisa"
                                        }
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
                            name={`familys.${index}.perfil_fisico_familiar.tallaPantalon`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Talla De Pantalón</FormLabel>
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
                            name={`familys.${index}.perfil_fisico_familiar.tallaZapatos`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
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
                        </fieldset>
                        <fieldset className="border grid grid-cols-2 gap-2 space-y-4 col-span-2 p-2">
                          <legend className="flex gap-2">
                            Datos De Salud <HeartPulse />
                          </legend>
                          <FormField
                            control={form.control}
                            name={`familys.${index}.perfil_salud_familiar.grupoSanguineo`}
                            render={({ field }) => (
                              <FormItem className="col-span-2 cursor-pointer">
                                <FormLabel className="cursor-pointer">
                                  Grupo Sanguineo{" "}
                                </FormLabel>
                                <Select
                                  onValueChange={(values) => {
                                    field.onChange(Number.parseInt(values));
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full truncate">
                                      <SelectValue
                                        placeholder={
                                          "Seleccione un Grupo Sanguineo"
                                        }
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {bloodGroup.data.map((bloodGroup, i) => (
                                      <SelectItem
                                        key={i}
                                        value={`${bloodGroup.id}`}
                                      >
                                        {bloodGroup.GrupoSanguineo}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <ScrollArea className="grid grid-cols-2 h-60 overflow-auto gap-4 p-4 border rounded-md col-span-2">
                            <div>
                              <h2 className="font-bold">
                                Patologias (Opcional)
                              </h2>
                              {patologyGroupList.map((patologys, index) => (
                                <>
                                  <h2 className="p-2 text-sm">
                                    * {patologys.categoria.toUpperCase()}
                                  </h2>
                                  {patologys.datos.map((patologyItem) => (
                                    <div className="flex flex-col justify-start gap-2 ">
                                      <FormField
                                        control={form.control}
                                        name={`familys.${index}.perfil_salud_familiar.patologiaCronica`}
                                        render={({ field }) => {
                                          const currentValues = Array.isArray(
                                            field.value,
                                          )
                                            ? field.value
                                            : [];
                                          return (
                                            <FormItem className="flex flex-row items-center space-y-2">
                                              <FormControl>
                                                <Checkbox
                                                  className="border-black cursor-pointer"
                                                  checked={currentValues.includes(
                                                    patologyItem.id,
                                                  )}
                                                  onCheckedChange={(
                                                    checked,
                                                  ) => {
                                                    const newValue = checked
                                                      ? [
                                                          ...currentValues,
                                                          patologyItem.id,
                                                        ]
                                                      : currentValues.filter(
                                                          (id) =>
                                                            id !==
                                                            patologyItem.id,
                                                        );

                                                    field.onChange(newValue);
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="font-normal cursor-pointer text-gray-500">
                                                {patologyItem.patologia}
                                              </FormLabel>
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    </div>
                                  ))}
                                </>
                              ))}
                            </div>
                            <Separator
                              className="h-full w-2 absolute m-auto top-0 bottom-0 left-0 right-0"
                              orientation="vertical"
                            />
                            <div>
                              <h2 className="font-bold">
                                {" "}
                                Dispacidades (Opcional)
                              </h2>
                              {disabilityGroupList.map((disability, index) => (
                                <>
                                  <h2 className="p-2 text-sm">
                                    * {disability.categoria.toUpperCase()}
                                  </h2>
                                  {disability.datos.map((disabilityItem, i) => (
                                    <div className="flex flex-col justify-start gap-2 ">
                                      <FormField
                                        control={form.control}
                                        name={`familys.${index}.perfil_salud_familiar.discapacidad`}
                                        render={({ field }) => {
                                          const currentValues = Array.isArray(
                                            field.value,
                                          )
                                            ? field.value
                                            : [];
                                          return (
                                            <FormItem className="flex flex-row space-y-2">
                                              <FormLabel className="order-2 text-gray-500 cursor-pointer">
                                                {disabilityItem.discapacidad}
                                              </FormLabel>
                                              <FormControl>
                                                <Checkbox
                                                  className="order-1 border-black cursor-pointer"
                                                  onCheckedChange={(
                                                    checked,
                                                  ) => {
                                                    const newValue = checked
                                                      ? [
                                                          ...currentValues,
                                                          disabilityItem.id,
                                                        ]
                                                      : currentValues.filter(
                                                          (id) =>
                                                            id !==
                                                            disabilityItem.id,
                                                        );

                                                    field.onChange(newValue);
                                                  }}
                                                />
                                              </FormControl>
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    </div>
                                  ))}
                                </>
                              ))}
                            </div>
                          </ScrollArea>
                        </fieldset>

                        <FormField
                          control={form.control}
                          name={`familys.${index}.observaciones`}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel
                                htmlFor="observaciones"
                                className="cursor-pointer"
                              >
                                Observaciones (Opcional)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  id="observaciones"
                                  placeholder="Describa las observaciones del familiar..."
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
                      </div>
                    </>
                  );
                })}
              </div>
            </fieldset>
            <Button className="w-full cursor-pointer">
              {" "}
              Registrar Trabajador
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
