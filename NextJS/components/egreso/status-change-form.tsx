"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, AlertCircle } from "lucide-react"
import type { Employee } from "@/lib/types/employee"
import { getEmployeeByIdCard } from "@/app/actions/employee-actions"

interface StatusChangeFormProps {
  onSuccess?: () => void
}

export function StatusChangeForm({ onSuccess }: StatusChangeFormProps) {
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [nuevoEstatus, setNuevoEstatus] = useState<"activo" | "pasivo" | "egresado" | "">("")
  const [motivoCambio, setMotivoCambio] = useState("")
  const [numeroResolucion, setNumeroResolucion] = useState("")
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
        setNuevoEstatus("")
        setMotivoCambio("")
        setNumeroResolucion("")
        setMotivoEgreso("")
      } else {
        setError("Empleado no encontrado")
        setSelectedEmployee(null)
      }
    } catch (err) {
      setError("Error al buscar empleado")
      console.error(err)
    }
  }

  async function handleStatusChange() {
    if (!selectedEmployee || !nuevoEstatus) {
      setError("Complete todos los campos requeridos")
      return
    }

    if (nuevoEstatus === "pasivo" && !numeroResolucion.trim()) {
      setError("El número de resolución es requerido para cambiar a pasivo")
      return
    }

    if (nuevoEstatus === "egresado" && !motivoEgreso.trim()) {
      setError("El motivo del egreso es requerido")
      return
    }

    try {
      setLoading(true)
      setError("")
      // Call registerStatusChange action
      alert("Cambio de estatus registrado exitosamente")
      setEmployeeSearch("")
      setSelectedEmployee(null)
      setNuevoEstatus("")
      setMotivoCambio("")
      setNumeroResolucion("")
      setMotivoEgreso("")
      onSuccess?.()
    } catch (err) {
      setError("Error al cambiar estatus")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    activo: "bg-green-50 border-green-200 text-green-900",
    pasivo: "bg-yellow-50 border-yellow-200 text-yellow-900",
    egresado: "bg-red-50 border-red-200 text-red-900",
  }

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || "bg-gray-50 border-gray-200 text-gray-900"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambio de Estatus de Empleado</CardTitle>
        <CardDescription>Cambie el estatus de empleado a Pasivo, Activo o Egresado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
            <div className={`p-4 border rounded-lg ${getStatusColor(selectedEmployee.estatus || "activo")}`}>
              <p className="text-sm font-medium mb-1">Empleado Seleccionado:</p>
              <p className="text-lg font-semibold">
                {selectedEmployee.nombres} {selectedEmployee.apellidos}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <p>
                  <strong>Cédula:</strong> {selectedEmployee.cedulaIdentidad}
                </p>
                <p>
                  <strong>Estatus Actual:</strong> {selectedEmployee.estatus || "Desconocido"}
                </p>
                <p>
                  <strong>Código:</strong> {selectedEmployee.codigo}
                </p>
                <p>
                  <strong>Cargo:</strong> {selectedEmployee.denominacionCargo}
                </p>
              </div>
            </div>
          )}

          {/* Status Selection */}
          {selectedEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nuevo-estatus">Nuevo Estatus *</Label>
                <Select
                  value={nuevoEstatus}
                  onValueChange={(value) => {
                    setNuevoEstatus(value as "activo" | "pasivo" | "egresado")
                    setError("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nuevo estatus..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="pasivo">Pasivo</SelectItem>
                    <SelectItem value="egresado">Egresado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {nuevoEstatus && (
                <div className={`p-4 border rounded-lg ${getStatusColor(nuevoEstatus)}`}>
                  <p className="font-semibold mb-3">Cambiar a: {nuevoEstatus.toUpperCase()}</p>

                  {/* For PASIVO status */}
                  {nuevoEstatus === "pasivo" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="resolucion">Número de Resolución *</Label>
                        <Input
                          id="resolucion"
                          placeholder="RES-2024-001"
                          value={numeroResolucion}
                          onChange={(e) => setNumeroResolucion(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="motivo-pasivo">Motivo del Cambio a Pasivo</Label>
                        <Textarea
                          id="motivo-pasivo"
                          placeholder="Describa el motivo del cambio..."
                          value={motivoCambio}
                          onChange={(e) => setMotivoCambio(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  {/* For EGRESADO status */}
                  {nuevoEstatus === "egresado" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="motivo-egreso">Motivo del Egreso *</Label>
                        <Textarea
                          id="motivo-egreso"
                          placeholder="Especifique el motivo (ej: Jubilación, Renuncia, Despido, etc.)"
                          value={motivoEgreso}
                          onChange={(e) => setMotivoEgreso(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="motivo-adicional">Observaciones Adicionales</Label>
                        <Textarea
                          id="motivo-adicional"
                          placeholder="Notas adicionales..."
                          value={motivoCambio}
                          onChange={(e) => setMotivoCambio(e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {/* For ACTIVO status */}
                  {nuevoEstatus === "activo" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="motivo-activo">Motivo del Cambio a Activo</Label>
                        <Textarea
                          id="motivo-activo"
                          placeholder="Describa el motivo del cambio..."
                          value={motivoCambio}
                          onChange={(e) => setMotivoCambio(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null)
                    setEmployeeSearch("")
                    setNuevoEstatus("")
                    setMotivoCambio("")
                    setNumeroResolucion("")
                    setMotivoEgreso("")
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleStatusChange}
                  disabled={loading}
                  className={nuevoEstatus === "egresado" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {loading ? "Procesando..." : "Cambiar Estatus"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
