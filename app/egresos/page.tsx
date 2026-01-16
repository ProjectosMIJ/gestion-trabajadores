import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { EgresoRegister } from "@/components/egreso/egreso-register"
import { EgresoList } from "@/components/egreso/egreso-list"

export default function EgresosPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Egresos</h1>
              <p className="text-muted-foreground mt-1">Registre bajas de empleados y mantenga histórico</p>
            </div>

            <EgresoRegister />
            <EgresoList />
          </div>
        </main>
      </div>
    </div>
  )
}
