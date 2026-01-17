"use client";

import {
  ArrowBigDownDash,
  ArrowBigUpDash,
  BookOpen,
  ChevronDownIcon,
  Cross,
  Trash,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BackgroundType, schemaBackground } from "../schemas/schema-background";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  onSubmit: (values: BackgroundType) => void;
  defaultValues: BackgroundType;
};
export default function FormBackground({ onSubmit, defaultValues }: Props) {
  const form = useForm({
    resolver: zodResolver(schemaBackground),
    defaultValues,
  });
  const { fields, append, remove, prepend } = useFieldArray({
    name: "antecedentes",
    control: form.control,
  });
  const onSubmitFormity = (data: z.infer<typeof schemaBackground>) => {
    onSubmit(data);
  };
  return (
    <Card className="flex flex-col gap-3">
      <CardHeader>
        <CardTitle>Antecedentes En La Administracion Publica</CardTitle>
      </CardHeader>
      <div className="flex justify-end gap-2  mr-4">
        <Button
          variant={"outline"}
          className="bg-red-500 border-2 border-red-600/25 hover:bg-red-600/90 cursor-pointer"
          onClick={() => {
            remove(
              fields
                .filter((field, index) => index !== 0)
                .map((field, index) => index + 1),
            );
          }}
        >
          <Trash />
        </Button>
        <Button
          variant={"outline"}
          className="bg-green-500 border-2 border-green-600/25 hover:bg-green-600/90 cursor-pointer"
          onClick={() => {
            prepend({
              fecha_ingreso: new Date(),
              fecha_egreso: new Date(),
              institucion: "",
            });
          }}
        >
          <Cross />
        </Button>
      </div>
      <CardContent className="">
        <Form {...form}>
          <form
            className="flex flex-row flex-wrap gap-2"
            onSubmit={form.handleSubmit(onSubmitFormity)}
          >
            <ScrollArea className="h-60   rounded-md w-full">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-row gap-5 space-y-5 items-center justify-around w-full"
                >
                  <FormField
                    control={form.control}
                    name={`antecedentes.${index}.fecha_ingreso`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {" "}
                          {index + 1}. Fecha Inicio <ArrowBigDownDash />
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                id="date-start"
                                className="w-48 justify-between font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <ChevronDownIcon />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              captionLayout="dropdown"
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1930-01-01")
                              }
                              onSelect={(date) => {
                                field.onChange(date);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`antecedentes.${index}.fecha_egreso`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {index + 1}. Fecha Culminacion <ArrowBigUpDash />
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                id="date-start"
                                className="w-48 justify-between font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "yyyy-MM-dd")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <ChevronDownIcon />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              captionLayout="dropdown"
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1930-01-01")
                              }
                              onSelect={(date) => {
                                field.onChange(date);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`antecedentes.${index}.institucion`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Del Ente/Institucion</FormLabel>
                        <FormControl>
                          <Input placeholder="MIJ" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant={"destructive"}
                    className={`${index === 0 ? "invisible" : ""} cursor-pointer`}
                    onClick={() => remove(index)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <Button className="mt-4 w-full cursor-pointer">Siguiente</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
