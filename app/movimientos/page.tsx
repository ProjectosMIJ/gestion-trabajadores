import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { MovementRegister } from "@/components/movements/movement-register"
import { MovementHistory } from "@/components/movements/movement-history"

export default function MovementsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Movimientos</h1>
              <p className="text-muted-foreground mt-1">Registre cambios de cargo y ubicación</p>
            </div>

            <MovementRegister />
            <MovementHistory />
          </div>
        </main>
      </div>
    </div>
  )
}
