"use client";
import { useForm } from "react-hook-form";
import {
  AcademyType,
  schemaAcademy,
} from "../schemas/schema-academic_training";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { AcademyLevel, ApiResponse, Carrera, Mencion } from "@/app/types/types";
import { useEffect, useState } from "react";
import { getAcademyLevel, getCarrera, getMencion } from "@/app/api/getInfoRac";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { array } from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmit: (values: AcademyType) => void;
  defaultValues: AcademyType;
};
export default function FormAcademyLevel({ onSubmit, defaultValues }: Props) {
  const [academyLevel, setAcademyLevel] = useState<ApiResponse<AcademyLevel[]>>(
    {
      status: "",
      message: "",
      data: [],
    },
  );
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
  const form = useForm({
    resolver: zodResolver(schemaAcademy),
    defaultValues,
  });
  useEffect(() => {
    const loadData = async () => {
      const [academyLevel, carrera] = await Promise.all([
        getAcademyLevel(),
        getCarrera(),
      ]);
      if (Array.isArray(academyLevel.data)) setAcademyLevel(academyLevel);
      if (Array.isArray(carrera.data)) setCarrera(carrera);
    };
    loadData();
  }, []);
  const onSubmitFormity = (values: AcademyType) => {
    onSubmit(values);
  };
  const getMentions = async (id: string) => {
    const responseMentions = await getMencion(id);
    if (Array.isArray(responseMentions.data)) setMencion(responseMentions);
  };
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Formacion Academica</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitFormity)}
                className="space-y-6 grid grid-cols-2 gap-4"
              >
                <FormField
                  control={form.control}
                  name="formacion_academica.nivel_Academico_id"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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
                      <FormDescription className="flex flex-row gap-2 justify-end">
                        <Label>Mas Detalles De Formacion Academica</Label>
                        <Switch onCheckedChange={setShowMoreDetails} />
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showMoreDetails && (
                  <>
                    <FormField
                      name="formacion_academica.institucion"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institucion (Opcional)</FormLabel>
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
                      name="formacion_academica.capacitacion"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacitacion (Opcional)</FormLabel>
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
                      name="formacion_academica.carrera_id"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormLabel>Carrera (Opcional)</FormLabel>
                          <Select
                            onValueChange={(values) => {
                              field.onChange(Number.parseInt(values));
                              getMentions(values);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full truncate">
                                <SelectValue
                                  placeholder={"Seleccione una carrera"}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {carrera.data.map((carrera, i) => (
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
                      name="formacion_academica.mencion_id"
                      render={({ field }) => (
                        <FormItem className=" ">
                          <FormLabel>Mención (Opcional)</FormLabel>
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
                  </>
                )}

                <Button className="w-full col-span-2">Siguiente</Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
