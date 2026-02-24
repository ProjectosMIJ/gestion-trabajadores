"use client";
import PageLayout from "../../../components/layout/page-layout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eraser, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Loading from "../../../components/loading/loading";
import TableEmployee from "../../../components/employees/tableEmployees/page";
import useSWR from "swr";
import { getFamilyEmployee } from "../../../api/getInfoRac";
import TableFamily from "../../../components/employees/tableFamilys/table";
export default function FamilyConsult() {
  const [employee, setEmployee] = useState<string | null>(null);

  const schemaSearch = z.object({
    cedula_empleado: z.string(),
  });
  const form = useForm({
    defaultValues: {
      cedula_empleado: "",
    },
    resolver: zodResolver(schemaSearch),
  });
  const { data: family, isLoading } = useSWR(
    employee ? ["family", employee] : null,
    async () => await getFamilyEmployee(employee!),
  );
  const onSearch = (values: z.infer<typeof schemaSearch>) => {
    setEmployee(values.cedula_empleado);
  };

  const cleanFields = () => {
    form.reset({
      cedula_empleado: "",
    });
  };
  return (
    <PageLayout
      description="Consulte El Familiar Del Trabajador"
      title="Consultar Familiar"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSearch)}
          className="flex flex-col justify-start gap-2 flex-1"
        >
          <div className="flex flex-row items-center gap-2 ">
            <FormField
              name="cedula_empleado"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buscar Cédula</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="buscar cedula..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button className="cursor-pointer self-baseline-last">
              Buscar <Search />
            </Button>
            <Button
              variant={"outline"}
              className="cursor-pointer self-baseline-last"
              type="button"
              onClick={cleanFields}
            >
              Limpiar <Eraser />
            </Button>
          </div>
        </form>
      </Form>
      {isLoading ? (
        <Loading promiseMessage="Cargando Información"></Loading>
      ) : (
        <>
          <TableFamily familys={family?.data ?? []} />
        </>
      )}
    </PageLayout>
  );
}
