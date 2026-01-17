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
import {
  CalendarIcon,
  Check,
  Contact,
  PersonStanding,
  Upload,
  X,
} from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerEmployee } from "@/app/personal/registrar/actions/registerEmployeesActions";
import { toast } from "sonner";
import { ApiResponse, MaritalStatusType } from "@/app/types/types";
import { getMaritalstatus } from "@/app/api/getInfoRac";
import { BasicInfoType, schemaBasicInfo } from "../schemas/schema-basic-info";
type Props = {
  onSubmit: (values: BasicInfoType) => void;
  defaultValues: BasicInfoType;
};
export function FormBasicInfo({ onSubmit, defaultValues }: Props) {
  const [maritalStatus, setMaritalStatus] = useState<
    ApiResponse<MaritalStatusType[]>
  >({
    status: "",
    message: "",
    data: [],
  });

  const [photoPreview, setPhotoPreview] = useState<string | null | undefined>(
    null,
  );

  useEffect(() => {
    const loadData = async () => {
      const [maritalStatus] = await Promise.all([getMaritalstatus()]);

      setMaritalStatus(maritalStatus);
      console.log(maritalStatus);
    };
    loadData();
  }, []);
  const form = useForm({
    resolver: zodResolver(schemaBasicInfo),
    defaultValues,
  });
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    form.setValue("file", null);
  };

  const onSubmitFormity = (data: BasicInfoType) => {
    onSubmit(data);
  };
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Registrar Nuevo Trabajador</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitFormity)}>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <FormField
                    control={form.control}
                    name="n_contrato"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero de Ingreso *</FormLabel>
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
                                    setPhotoPreview(URL.createObjectURL(file));
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
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="cedulaidentidad"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="flex flex-row items-center">
                          Cedula de identidad * <Contact />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="000000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Bernardo" {...field} />
                        </FormControl>

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

                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="fechaingresoorganismo"
                    render={({ field }) => (
                      <FormItem className="flex flex-col  grow shrink basis-40">
                        <FormLabel> Fecha de Ingreso al Organismo *</FormLabel>
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
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button className="w-full">Siguiente</Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
