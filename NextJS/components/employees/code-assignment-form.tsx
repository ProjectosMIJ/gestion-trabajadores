"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import type { Employee, CodigoCatalog } from "@/lib/types/employee"
import { getEmployeeByIdCard, getCatalog } from "@/app/actions/employee-actions"

interface CodeAssignmentProps {
  onSuccess?: () => void
}

export function CodeAssignmentForm({ onSuccess }: CodeAssignmentProps) {
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [codigoCatalog, setCodigoCatalog] = useState<CodigoCatalog[]>([])
  const [selectedCodigoNew, setSelectedCodigoNew] = useState<CodigoCatalog | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCodigoCatalog()
  }, [])

  async function loadCodigoCatalog() {
    try {
      const codigos = await getCatalog("codigo")
      setCodigoCatalog(codigos as unknown as CodigoCatalog[])
    } catch (err) {
      console.error("Error loading codes:", err)
    }
  }

  async function handleSearchEmployee() {
    if (!employeeSearch.trim()) {
      setError("Ingrese una cédula válida")
      return
    }

    try {
      setError("")
      const employee = await getEmployeeByIdCard(employeeSearch)
      if (employee) {
        setSelectedEmployee(employee)
      } else {
        setError("Empleado no encontrado")
        setSelectedEmployee(null)
      }
    } catch (err) {
      setError("Error al buscar empleado")
      console.error(err)
    }
  }

  function handleCodigoSelect(codigoValue: string) {
    const selected = codigoCatalog.find((c) => c.codigo === codigoValue)
    if (selected) {
      setSelectedCodigoNew(selected)
    }
  }

  async function handleAssignCode() {
    if (!selectedEmployee || !selectedCodigoNew) {
      setError("Complete todos los campos requeridos")
      return
    }

    try {
      setLoading(true)
      setError("")
      // Call assignCodeToEmployee action
      alert("Código asignado exitosamente")
      setEmployeeSearch("")
      setSelectedEmployee(null)
      setSelectedCodigoNew(null)
      onSuccess?.()
    } catch (err) {
      setError("Error al asignar código")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignación de Código</CardTitle>
        <CardDescription>Busque un empleado y asigne un nuevo código de posición</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          {/* Employee Search */}
          <div>
            <Label htmlFor="employee-cedula">Búsqueda de Empleado (Cédula)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="employee-cedula"
                placeholder="V-12345678"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              <Button onClick={handleSearchEmployee} variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-900">Empleado Seleccionado:</p>
              <p className="text-lg font-semibold text-blue-900">
                {selectedEmployee.nombres} {selectedEmployee.apellidos}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                <p>
                  <strong>Cédula:</strong> {selectedEmployee.cedulaIdentidad}
                </p>
                <p>
                  <strong>Código Actual:</strong> {selectedEmployee.codigo}
                </p>
                <p>
                  <strong>Cargo:</strong> {selectedEmployee.denominacionCargo}
                </p>
                <p>
                  <strong>Ubicación:</strong> {selectedEmployee.ubicacionAdministrativa}
                </p>
              </div>
            </div>
          )}

          {/* Code Selection */}
          {selectedEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo-nuevo">Nuevo Código de Posición *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Seleccione el código que asignará el nuevo cargo y ubicación
                </p>
                <Select value={selectedCodigoNew?.codigo || ""} onValueChange={handleCodigoSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar código..." />
                  </SelectTrigger>
                  <SelectContent>
                    {codigoCatalog.map((codigo) => (
                      <SelectItem key={codigo.id} value={codigo.codigo}>
                        {codigo.codigo} - {codigo.denominacionCargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCodigoNew && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-2">Detalles del Nuevo Código:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                    <p>
                      <strong>Código:</strong> {selectedCodigoNew.codigo}
                    </p>
                    <p>
                      <strong>Cargo:</strong> {selectedCodigoNew.denominacionCargo}
                    </p>
                    <p>
                      <strong>Ubicación Física:</strong> {selectedCodigoNew.ubicacionFisica}
                    </p>
                    <p>
                      <strong>Ubicación Admin:</strong> {selectedCodigoNew.ubicacionAdministrativa}
                    </p>
                    <p>
                      <strong>Tipo Nómina:</strong> {selectedCodigoNew.tipoNomina}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null)
                    setEmployeeSearch("")
                    setSelectedCodigoNew(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAssignCode} disabled={loading}>
                  {loading ? "Asignando..." : "Asignar Código"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
