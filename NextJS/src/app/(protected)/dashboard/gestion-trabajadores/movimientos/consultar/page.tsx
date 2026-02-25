"use client";
import PageLayout from "../../components/layout/page-layout";
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
import useSWR from "swr";
import z from "zod";
import {
  getEmployeeDataSearch,
  getHistoryMoveEmploye,
  getNomina,
} from "../../api/getInfoRac";
import TableEmployee from "../../components/employees/tableEmployees/page";
import Loading from "../../components/loading/loading";
import { Card } from "@/components/ui/card";
import TableMoves from "../../components/movimientos/tableMoves/page";

export default function TableMovesPage() {
  const [isPending, startTransition] = useTransition();
  const [employee, setEmployee] = useState<string | null>(null);
  const schemaSearch = z.object({
    cedulaidentidad: z.string(),
  });
  const form = useForm({
    defaultValues: {
      cedulaidentidad: "",
    },
    resolver: zodResolver(schemaSearch),
  });

  const onSearch = (values: z.infer<typeof schemaSearch>) => {
    setEmployee(values.cedulaidentidad);
  };
  const cleanFields = () => {
    form.reset({
      cedulaidentidad: "",
    });
  };
  const { data: history, isLoading } = useSWR(
    employee ? ["history", employee] : null,
    async () => await getHistoryMoveEmploye(employee!),
  );
  return (
    <PageLayout
      title="Consulta De Movimientos De Trabajadores"
      description="Verifique El Movimiento Del Personal"
    >
      <Card className="flex h-screen border-none rounded-none ">
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-auto bg-muted/30 p-6 ">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSearch)}
                className="flex flex-col justify-start gap-2 flex-1"
              >
                <div className="flex flex-row items-center gap-2 ">
                  <FormField
                    name="cedulaidentidad"
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
            {isLoading || isPending ? (
              <Loading promiseMessage="Cargando Información"></Loading>
            ) : (
              <>
                <TableMoves movesData={history?.data ?? []} />
              </>
            )}
          </main>
        </div>
      </Card>
    </PageLayout>
  );
}
