import {
  getBloodGroup,
  getDisability,
  getPatologys,
} from "@/app/(protected)/dashboard/gestion-trabajadores/api/getInfoRac";
import { DisabilitysType, PatologysType } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import Loading from "../../../components/loading/loading";
import {
  HealthType,
  schemaHealthProfile,
} from "../schemas/schema-health_profile";

type Props = {
  onSubmit: (values: HealthType) => void;
  defaultValues: HealthType;
};

export default function FormHealth({ onSubmit, defaultValues }: Props) {
  const form = useForm({
    resolver: zodResolver(schemaHealthProfile),
    defaultValues,
  });
  const { data: patology, isLoading: isLoadingPatology } = useSWR(
    "patology",
    async () => await getPatologys(),
  );
  const { data: bloodGroup, isLoading: isLoadingBloodGroup } = useSWR(
    "blood",
    async () => await getBloodGroup(),
  );
  const { data: disability, isLoading: isLoadingDisability } = useSWR(
    "disability",
    async () => await getDisability(),
  );
  const onSubmitFormity = (values: HealthType) => {
    onSubmit(values);
  };
  const disabilityGroupList = useMemo(() => {
    const data = disability?.data; // Extrae aquí
    if (!data) return [];
    return disability.data.reduce(
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
  }, [disability]);

  const patologyGroupList = useMemo(() => {
    const data = patology?.data;
    if (!data) return [];
    return patology.data.reduce(
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
  }, [patology]);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle> Datos De Salud</CardTitle>
        </CardHeader>

        <CardContent>
          <CardAction className="text-gray-500">
            Paso 4: Perfil De Salud
          </CardAction>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitFormity)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="perfil_salud.grupoSanguineo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo Sanguineo </FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(Number.parseInt(values));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingBloodGroup ? "Cargando Grupos Sanguineos" : "Seleccione un Grupo Sanguineo"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodGroup?.data.map((bloodGroup, i) => (
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
                <ScrollArea className="grid grid-cols-2 h-60 overflow-auto gap-4 p-4 border rounded-md">
                  <div>
                    <h2 className="font-bold">Patologias (Opcional)</h2>
                    {patologyGroupList.map((patologys, index) => (
                      <div key={index}>
                        <h2 className="p-2 text-sm font-bold">
                          * {patologys.categoria.toUpperCase()}
                        </h2>
                        {patologys.datos.map((patologyItem, i) => (
                          <div
                            className="flex flex-col justify-start gap-2  "
                            key={i}
                          >
                            <FormField
                              control={form.control}
                              name="perfil_salud.patologiaCronica"
                              render={({ field }) => {
                                const currentValues = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                if (isLoadingPatology) {
                                  return <Loading />;
                                }
                                return (
                                  <FormItem className="flex flex-row items-center space-y-2 ">
                                    <FormControl>
                                      <Checkbox
                                        className="border-black"
                                        checked={currentValues.includes(
                                          patologyItem.id,
                                        )}
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [
                                                ...currentValues,
                                                patologyItem.id,
                                              ]
                                            : currentValues.filter(
                                                (id) => id !== patologyItem.id,
                                              );

                                          field.onChange(newValue);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel
                                      key={index}
                                      className="cursor-pointer"
                                    >
                                      {patologyItem.patologia}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <Separator
                    className="h-full w-2 absolute m-auto top-0 bottom-0 left-0 right-0"
                    orientation="vertical"
                  />
                  <div>
                    <h2 className="font-bold"> Dispacidades (Opcional)</h2>
                    {disabilityGroupList.map((disability, index) => (
                      <div key={index}>
                        <h2 className="p-2 text-sm font-bold">
                          * {disability.categoria.toUpperCase()}
                        </h2>
                        {disability.datos.map((disabilityItem, i) => (
                          <div
                            className="flex flex-col justify-start gap-2 "
                            key={i}
                          >
                            <FormField
                              control={form.control}
                              name={`perfil_salud.discapacidad`}
                              render={({ field }) => {
                                const currentValues = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                if (isLoadingDisability) {
                                  return <Loading />;
                                }
                                return (
                                  <FormItem className="flex flex-row space-y-2">
                                    <FormLabel className="order-2">
                                      {disabilityItem.discapacidad}
                                    </FormLabel>
                                    <FormControl>
                                      <Checkbox
                                        className="order-1 border-black"
                                        onCheckedChange={(checked) => {
                                          const newValue = checked
                                            ? [
                                                ...currentValues,
                                                disabilityItem.id,
                                              ]
                                            : currentValues.filter(
                                                (id) =>
                                                  id !== disabilityItem.id,
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
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Button className="w-full">Siguiente</Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
