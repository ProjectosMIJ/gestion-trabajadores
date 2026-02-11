import { Code } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  schemaUpdateCodeTable,
  UpdateCodeTable,
} from "../schema/schema-update-code";
import {
  getCargo,
  getCargoEspecifico,
  getCoordination,
  getDirectionGeneral,
  getDirectionLine,
  getGrado,
  getNomina,
} from "../../../api/getInfoRac";
import useSWR from "swr";
import { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Airplay } from "lucide-react";
import { updateCodeTable } from "../actions/update-code";
import { toast } from "sonner";
import Loading from "../../../components/loading/loading";
interface Props {
  code: Code;
}
export default function UpdateCode({ code }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selecteIdDirectionGeneral, setSelecteIdDirectionGeneral] =
    useState<string>();
  const [selecteIdDirectionLine, setSelecteIdDirectionLine] =
    useState<string>();
  const { data: directionGeneral, isLoading: isLoadingDirectionGeneral } =
    useSWR("directionGeneral", async () => await getDirectionGeneral());
  const { data: directionLine, isLoading: isLoadingDirectionLine } = useSWR(
    selecteIdDirectionGeneral
      ? ["directionLine", selecteIdDirectionGeneral]
      : "",
    async () => await getDirectionLine(selecteIdDirectionGeneral!),
  );
  const { data: coordination, isLoading: isLoadingCoordination } = useSWR(
    selecteIdDirectionLine ? ["coordination", selecteIdDirectionLine] : null,
    async () => await getCoordination(selecteIdDirectionLine!),
  );
  const { data: cargoEspecifico, isLoading: isLoadingCargoEspecifico } = useSWR(
    "cargoEspecifico",
    async () => await getCargoEspecifico(),
  );
  const { data: cargo, isLoading: isLoadingCargo } = useSWR(
    "cargo",
    async () => await getCargo(),
  );
  const { data: nomina, isLoading: isLoadingNomina } = useSWR(
    "nomina",
    async () => await getNomina(),
  );
  const { data: grado, isLoading: isLoadingGrado } = useSWR("grado", async () =>
    getGrado(),
  );
  const form = useForm({
    defaultValues: {
      Coordinacion: code.Coordinacion?.id || undefined,
      denominacioncargoespecificoid:
        code.denominacioncargoespecifico?.id || undefined,
      denominacioncargoid: code.denominacioncargo?.id || undefined,
      DireccionGeneral: code.DireccionGeneral?.id || undefined,
      DireccionLinea: code.DireccionLinea?.id || undefined,
      gradoid: code.grado?.id || undefined,
      tiponominaid: code.tiponomina?.id || undefined,
    },
    resolver: zodResolver(schemaUpdateCodeTable),
  });
  const onSubmit = (values: UpdateCodeTable) => {
    startTransition(async () => {
      const response = await updateCodeTable(values, code.id);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };
  return (
    <Dialog onOpenChange={() => isPending}>
      <DialogTrigger asChild>
        <Button>Actualizar Código</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-2">
            ¿Esta Seguro Que Desea Actualizar El Cargo?
          </DialogTitle>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="denominacioncargoespecificoid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Denominación De Cargo Específico</FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(Number.parseInt(values));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingCargoEspecifico ? "Cargando Cargos Especificos" : "Seleccione una Denominación De Cargo Específico"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cargoEspecifico?.data.map((cargo, i) => (
                            <SelectItem key={i} value={`${cargo.id}`}>
                              {cargo.cargo}
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
                  name="denominacioncargoid"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormLabel>Denominación De Cargo</FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(Number.parseInt(values));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingCargo ? "Cargando Denominaciones De Cargo" : "Seleccione una Denominación De Cargo"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cargo?.data.map((cargo, i) => (
                            <SelectItem key={i} value={`${cargo.id}`}>
                              {cargo.cargo}
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
                  name="tiponominaid"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormLabel>Tipo de Nomina</FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(Number.parseInt(values));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingNomina ? "Cargando Nominas" : "Seleccione un Tipo de Nómina"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {nomina?.data.map((nomina, i) => (
                            <SelectItem key={i} value={`${nomina.id}`}>
                              {nomina.nomina}
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
                  name="gradoid"
                  render={({ field }) => (
                    <FormItem className=" ">
                      <FormLabel>Grado</FormLabel>
                      <Select
                        onValueChange={(values) => {
                          field.onChange(Number.parseInt(values));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingGrado ? "Cargando Grados" : "Seleccione un Grado"}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grado?.data.map((grado, i) => (
                            <SelectItem key={i} value={`${grado.id}`}>
                              {grado.grado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  name="DireccionGeneral"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Dirección General</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            setSelecteIdDirectionGeneral(value);
                            field.onChange(Number.parseInt(value));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={`${isLoadingDirectionGeneral ? "Cargando Direcciones Generales" : "Seleccionar Dirección General"}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>
                                Direcciones De Generales
                              </SelectLabel>
                              {directionGeneral?.data.map((general, i) => (
                                <SelectItem key={i} value={`${general.id}`}>
                                  {general.Codigo}-{general.direccion_general}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="DireccionLinea"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección De Linea</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            setSelecteIdDirectionLine(value);
                            field.onChange(Number.parseInt(value));
                          }}
                        >
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={` ${isLoadingDirectionLine ? "Cargando Direcciones de Linea" : "Seleccionar Direcciones De Linea"}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Direcciones De Linea</SelectLabel>
                              {directionLine?.data.map((line, i) => (
                                <SelectItem key={i} value={`${line.id}`}>
                                  {line.Codigo}-{line.direccion_linea}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="Coordinacion"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordinación</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number.parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-full truncate">
                            <SelectValue
                              placeholder={`${isLoadingCoordination ? "Cargando Coordinaciones" : "Seleccionar Coordinación"} `}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Coordinaciones</SelectLabel>
                              {coordination?.data.map((coord, i) => (
                                <SelectItem key={i} value={`${coord.id}`}>
                                  {coord.Codigo}-{coord.coordinacion}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button className="flex-1">
                {" "}
                Actualizar Cargo <Airplay />
              </Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
