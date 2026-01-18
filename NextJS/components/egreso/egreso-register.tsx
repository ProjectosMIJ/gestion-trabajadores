"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { Employee } from "@/lib/types/employee"
import { getEmployeeByIdCard, registerEgreso } from "@/app/actions/employee-actions"

interface EgresoRegisterProps {
  onSuccess?: () => void
}

export function EgresoRegister({ onSuccess }: EgresoRegisterProps) {
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [motivoEgreso, setMotivoEgreso] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

  async function handleRegisterEgreso() {
    if (!selectedEmployee) {
      setError("Seleccione un empleado")
      return
    }

    if (!motivoEgreso.trim()) {
      setError("Ingrese el motivo del egreso")
      return
    }

    try {
      setLoading(true)
      setError("")
      await registerEgreso(selectedEmployee.cedulaIdentidad, motivoEgreso)
      alert("Egreso registrado exitosamente")
      setEmployeeSearch("")
      setSelectedEmployee(null)
      setMotivoEgreso("")
      onSuccess?.()
    } catch (err) {
      setError("Error al registrar el egreso")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle>Registrar Egreso de Empleado</CardTitle>
        <CardDescription>Registre la baja y migre los datos a histórico</CardDescription>
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
              <Button onClick={handleSearchEmployee}>Buscar</Button>
            </div>
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="p-4 bg-muted rounded-lg border-l-4 border-destructive">
              <p className="text-sm font-medium">Empleado Seleccionado:</p>
              <p className="text-lg font-semibold">
                {selectedEmployee.nombres} {selectedEmployee.apellidos}
              </p>
              <p className="text-sm text-muted-foreground">Cédula: {selectedEmployee.cedulaIdentidad}</p>
              <p className="text-sm text-muted-foreground">Cargo: {selectedEmployee.denominacionCargo}</p>
              <p className="text-sm text-muted-foreground">
                Ingreso: {new Date(selectedEmployee.fechaIngresoOrganismo).toLocaleDateString("es-ES")}
              </p>
            </div>
          )}

          {/* Egreso Reason */}
          {selectedEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="motivo">Motivo del Egreso</Label>
                <Textarea
                  id="motivo"
                  placeholder="Especifique el motivo (ej: Jubilación, Renuncia, Despido, etc.)"
                  value={motivoEgreso}
                  onChange={(e) => setMotivoEgreso(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null)
                    setEmployeeSearch("")
                    setMotivoEgreso("")
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={handleRegisterEgreso}
                  disabled={loading}
                >
                  {loading ? "Registrando..." : "Registrar Egreso"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
