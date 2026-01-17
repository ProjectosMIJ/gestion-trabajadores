"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  PhysicalProfileType,
  schemaPhysicalProfile,
} from "../schemas/schema-physical_profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPantsSize, getShirtSize, getShoesSize } from "@/app/api/getInfoRac";
import { useEffect, useState } from "react";
import {
  ApiResponse,
  PantsSize,
  ShirtSize,
  ShoesSize,
} from "@/app/types/types";
import { Button } from "@/components/ui/button";

type Props = {
  onSubmit: (values: PhysicalProfileType) => void;
  defaultValues: PhysicalProfileType;
};
export default function FormPhysical({ onSubmit, defaultValues }: Props) {
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
  const form = useForm({
    resolver: zodResolver(schemaPhysicalProfile),
    defaultValues,
  });
  useEffect(() => {
    const loadData = async () => {
      const [shirtSize, pantsSize, shoesSize] = await Promise.all([
        getShirtSize(),
        getPantsSize(),
        getShoesSize(),
      ]);

      if (Array.isArray(shirtSize.data)) setShirtSize(shirtSize);
      if (Array.isArray(pantsSize.data)) setPantsSize(pantsSize);
      if (Array.isArray(shoesSize.data)) setShoesSize(shoesSize);
    };
    loadData();
  }, []);
  const onSubmitFormity = (data: z.infer<typeof schemaPhysicalProfile>) => {
    onSubmit(data);
  };
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Vestimenta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid grid-cols-2 gap-2 space-y-2"
            onSubmit={form.handleSubmit(onSubmitFormity)}
          >
            <FormField
              control={form.control}
              name="perfil_fisico.tallaCamisa"
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
              name="perfil_fisico.tallaPantalon"
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
              name="perfil_fisico.tallaZapatos"
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
            <Button className="w-full col-span-2">Siguiente</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
