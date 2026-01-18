"use client";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { CodigoCatalogForm } from "@/components/employees/codigo-catalog-form";
import { CodeListPage } from "@/components/employees/code-list";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CodigoCatalogEspecialForm } from "@/components/employees/asignar-codigo-especial-form";
export default function AsignarCodigoPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Crear Nuevo Código
              </h1>
              <p className="text-muted-foreground mt-1">
                Cree nuevos códigos de posición con sus atributos de cargo,
                ubicación y nómina
              </p>
            </div>
            <CodigoCatalogForm />
          </div>
        </main>
      </div>
    </div>
  );
}
