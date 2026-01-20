"use client";

import { CodigoCatalogEspecialForm } from "../../components/employees/asignar-codigo-especial-form";

export default function AsignarCodigoEspecialPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Asignacion De Codigos A Nominas Especiales
              </h1>
              <p className="text-muted-foreground mt-1">
                Cree un nuevo codigo auto generable segun la nomina especial
              </p>
            </div>
            <CodigoCatalogEspecialForm />
          </div>
        </main>
      </div>
    </div>
  );
}
