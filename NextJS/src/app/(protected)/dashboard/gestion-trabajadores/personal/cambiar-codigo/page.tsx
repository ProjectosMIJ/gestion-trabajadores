"use client";

import { ChangeCodeForm } from "../../components/employees/cambiar-codigo-form";

export default function ChangeCodePage() {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Cambiar Cargo
              </h1>
              <p className="text-muted-foreground mt-1">
                Asigne Un Cambio de Cargo Al Empleado
              </p>
            </div>
            <ChangeCodeForm />
          </div>
        </main>
      </div>
    </div>
  );
}
