"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { FamilyRegister } from "@/components/family/family-register"
import { FamilyList } from "@/components/family/family-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function FamiliarsPage() {
  const [selectedEmployeeCedula, setSelectedEmployeeCedula] = useState("")
  const [employeeSearchInput, setEmployeeSearchInput] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSearchEmployee() {
    if (employeeSearchInput.trim()) {
      setSelectedEmployeeCedula(employeeSearchInput)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Familiares</h1>
              <p className="text-muted-foreground mt-1">Administre dependientes de empleados</p>
            </div>

            {/* Employee Selection */}
            <div className="bg-card rounded-lg border p-4">
              <label className="text-sm font-medium text-foreground">Seleccionar Empleado (por Cédula)</label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="V-12345678"
                  value={employeeSearchInput}
                  onChange={(e) => setEmployeeSearchInput(e.target.value)}
                />
                <Button onClick={handleSearchEmployee}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {selectedEmployeeCedula && (
                <p className="text-sm text-green-600 mt-2">Empleado seleccionado: {selectedEmployeeCedula}</p>
              )}
            </div>

            {/* Family Components */}
            {selectedEmployeeCedula && (
              <>
                <FamilyRegister
                  employeeCedula={selectedEmployeeCedula}
                  onSuccess={() => setRefreshKey((prev) => prev + 1)}
                />
                <FamilyList key={refreshKey} employeeCedula={selectedEmployeeCedula} />
              </>
            )}

            {!selectedEmployeeCedula && (
              <div className="bg-muted/50 rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">Seleccione un empleado para ver y administrar sus familiares</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
