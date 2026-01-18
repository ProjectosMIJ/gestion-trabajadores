import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { StatusChangeForm } from "@/components/egreso/status-change-form"

export default function Page() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Header />
        <main className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Cambio de Estatus</h1>
              <p className="text-muted-foreground">
                Gestione cambios de estatus para empleados: Activo, Pasivo o Egresado
              </p>
            </div>
            <StatusChangeForm />
          </div>
        </main>
      </div>
    </div>
  )
}
