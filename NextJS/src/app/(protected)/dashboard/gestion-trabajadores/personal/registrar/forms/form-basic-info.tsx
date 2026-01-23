"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Contact, Upload, X } from "lucide-react";

import {
  getMaritalstatus,
  getSex,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { validateWeight } from "@/constants/fileSize";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { BasicInfoType, schemaBasicInfo } from "../schemas/schema-basic-info";
type Props = {
  onSubmit: (values: BasicInfoType) => void;
  defaultValues: BasicInfoType;
};
export function FormBasicInfo({ onSubmit, defaultValues }: Props) {
  const [photoPreview, setPhotoPreview] = useState<string | null | undefined>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);
  const { data: maritalStatus, isLoading: isLoadingMaritalStatus } = useSWR(
    "maritalStatus",
    async () => await getMaritalstatus(),
  );
  const { data: sex, isLoading: isLoadingSex } = useSWR(
    "sex",
    async () => await getSex(),
  );
  const form = useForm({
    resolver: zodResolver(schemaBasicInfo),
    defaultValues,
  });
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    form.setValue("file", null as unknown as File);
  };

  const onSubmitFormity = (data: BasicInfoType) => {
    onSubmit(data);
  };
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Registrar Nuevo Trabajador</CardTitle>
      </CardHeader>

      <CardContent>
        <CardAction className="text-gray-500">
          Paso 1: Informacion Basica
        </CardAction>
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
                    <div className="relative w-full h-40 p-2">
                      <Image
                        height={150}
                        width={100}
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
                      <div className="text-center w-full">
                        {
                          validateWeight(
                            file?.size ? file.size : 0,
                            5 * 1024 * 1024,
                          ).formattedSize
                        }
                      </div>
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
                                accept=".png,.jpeg,.jpg"
                                className="hidden"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  onChange(file);
                                  if (file) {
                                    setFile(file);
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
                    name="fecha_nacimiento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col  grow shrink basis-40 ">
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
                    name={`sexoid`}
                    render={({ field }) => (
                      <FormItem className=" cursor-pointer">
                        <FormLabel className="cursor-pointer">Sexo *</FormLabel>
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
                    name="estadoCivil"
                    render={({ field }) => (
                      <FormItem className="col-span-2 ">
                        <FormLabel>Estado Civil </FormLabel>
                        <Select
                          onValueChange={(values) => {
                            field.onChange(Number.parseInt(values));
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full truncate">
                              <SelectValue
                                placeholder={`${isLoadingMaritalStatus ? "Cargando Estado Civil" : "Seleccione Un Estado Civil"}`}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatus?.data.map((status, i) => (
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
