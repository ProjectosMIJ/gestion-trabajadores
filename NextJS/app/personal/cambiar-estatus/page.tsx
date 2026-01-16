"use client";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

import { AsigCode } from "@/components/employees/asignar-codigo-form";
import { ChangeStatusForm } from "@/components/employees/change-status-form";
export default function ChangeStatusPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Cambiar Estatus Del Empleado
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestione El Estatus del Empleado
              </p>
            </div>
            <ChangeStatusForm />
          </div>
        </main>
      </div>
    </div>
  );
}
