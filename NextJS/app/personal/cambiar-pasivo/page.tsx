"use client";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

import { PasivoForm } from "@/components/employees/cambiar-personal-pasivo-form";
export default function PasivoPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestion De Personal
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestionar El Personal Trabajador
              </p>
            </div>
            <PasivoForm />
          </div>
        </main>
      </div>
    </div>
  );
}
