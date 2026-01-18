import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HealthType,
  schemaHealthProfile,
} from "../schemas/schema-health_profile";
import { useEffect, useState } from "react";
import {
  ApiResponse,
  BloodGroupType,
  DisabilitysType,
  PatologysType,
} from "@/app/types/types";
import {
  getBloodGroup,
  getDisability,
  getPatologys,
} from "@/app/api/getInfoRac";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MultipleSelector from "@/components/multiSelect";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { it } from "node:test";
import { group } from "console";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { boolean } from "zod";
import { Input } from "@/components/ui/input";
import { Circle } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = {
  onSubmit: (values: HealthType) => void;
  defaultValues: HealthType;
};

export default function FormHealth({ onSubmit, defaultValues }: Props) {
  const [disability, setDisability] = useState<ApiResponse<DisabilitysType[]>>({
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
  const [receiver, setReceiver] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(schemaHealthProfile),
    defaultValues,
  });
  useEffect(() => {
    const loadData = async () => {
      const [patology, bloodGroup, disability] = await Promise.all([
        getPatologys(),
        getBloodGroup(),
        getDisability(),
      ]);

      if (Array.isArray(patology.data)) setPatology(patology);
      if (Array.isArray(bloodGroup.data)) setBloodGroup(bloodGroup);
      if (Array.isArray(disability.data)) setDisability(disability);
      console.log(form.getValues());
    };
    loadData();
  }, [receiver]);

  const onSubmitFormity = (values: HealthType) => {
    onSubmit(values);
  };
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
                <ScrollArea className="grid grid-cols-2 h-60 overflow-auto gap-4 p-4 border rounded-md">
                  <div>
                    <h2 className="font-bold">Patologias (Opcional)</h2>
                    {patologyGroupList.map((patologys, index) => (
                      <>
                        <h2 className="p-2 text-sm">
                          * {patologys.categoria.toUpperCase()}
                        </h2>
                        {patologys.datos.map((patologyItem) => (
                          <div className="flex flex-col justify-start gap-2 ">
                            <FormField
                              control={form.control}
                              name="perfil_salud.patologiaCronica"
                              render={({ field }) => {
                                const currentValues = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                return (
                                  <FormItem className="flex flex-row items-center space-y-2">
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
                                    <FormLabel className="font-normal cursor-pointer">
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
                    <h2 className="font-bold"> Dispacidades (Opcional)</h2>
                    {disabilityGroupList.map((disability, index) => (
                      <>
                        <h2 className="p-2 text-sm">
                          * {disability.categoria.toUpperCase()}
                        </h2>
                        {disability.datos.map((disabilityItem, i) => (
                          <div className="flex flex-col justify-start gap-2 ">
                            <FormField
                              control={form.control}
                              name={`perfil_salud.discapacidad`}
                              render={({ field }) => {
                                const currentValues = Array.isArray(field.value)
                                  ? field.value
                                  : [];
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
                      </>
                    ))}
                  </div>
                </ScrollArea>

                <Button className="w-full">Siguiente</Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Switch onCheckedChange={setReceiver} />
    </>
  );
}
