"use client";

import { useForm } from "react-hook-form";
import { DwellingType, schemaDwelling } from "../schemas/schema-dwelling";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getConditionDwelling, getStates } from "@/app/api/getInfoRac";
import {
  ApiResponse,
  ConditionDwelling,
  Municipality,
  Parish,
  States,
} from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
export type Props = {
  onSubmit: (values: DwellingType) => void;
  defaultValues: DwellingType;
};

export default function FormDwelling({ onSubmit, defaultValues }: Props) {
  const [bool, setBool] = useState(false);
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

  const [states, setStates] = useState<ApiResponse<States[]>>({
    status: "",
    message: "",
    data: [],
  });
  const [conditionDwelling, setConditionDwelling] = useState<
    ApiResponse<ConditionDwelling[]>
  >({
    status: "",
    message: "",
    data: [],
  });
  useEffect(() => {
    const loadData = async () => {
      const [states, conditionDwelling] = await Promise.all([
        getStates(),
        getConditionDwelling(),
      ]);

      if (Array.isArray(states.data)) setStates(states);
      if (Array.isArray(conditionDwelling.data))
        setConditionDwelling(conditionDwelling);
    };
    loadData();
  }, [bool]);
  const form = useForm({
    resolver: zodResolver(schemaDwelling),
    defaultValues,
  });
  const getMunicipalitys = async (id: number) => {
    const responseMunicipalitys = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/municipios/${id}/`,
    );
    const getMunicipalitys = await responseMunicipalitys.json();
    setMunicipalitys(getMunicipalitys);
  };

  const getParish = async (id: number) => {
    const responseParish = await fetch(
      `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/parroquias/${id}/`,
    );
    const getParish = await responseParish.json();
    setParish(getParish);
  };
  const onSubmitFormity = (values: DwellingType) => {
    onSubmit(values);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Datos Socio-economicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitFormity)}
                className="grid grid-cols-2 gap-3 space-y-3"
              >
                <FormField
                  control={form.control}
                  name="datos_vivienda.estado_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number.parseInt(value));
                          getMunicipalitys(Number.parseInt(value));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue placeholder={"Seleccione un Estado"} />
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
                  name="datos_vivienda.municipio_id"
                  render={({ field }) => (
                    <FormItem>
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
                            <SelectItem key={i} value={`${municipality.id}`}>
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
                  name="datos_vivienda.parroquia"
                  render={({ field }) => (
                    <FormItem>
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
                <FormField
                  control={form.control}
                  name="datos_vivienda.condicion_vivienda_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condicion De Vivienda *</FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(Number.parseInt(values));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={
                                "Seleccione una Condicion De Vivienda"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditionDwelling.data.map(
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
                      <FormDescription>
                        Esta Informacion Sera Publica
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full col-span-2">Siguiente</Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Switch onCheckedChange={setBool} />
    </>
  );
}
