"use client";

import { AsigCode } from "../../components/employees/asignar-codigo-form";

export default function AsignarCodigoPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Asignación De Cargos
              </h1>
              <p className="text-muted-foreground mt-1">
                Asigne Un Nuevo Codigo Al Personal
              </p>
            </div>
            <AsigCode />
          </div>
        </main>
      </div>
    </div>
  );
}
