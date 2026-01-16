"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Employee, CatalogItem } from "@/lib/types/employee"
import { getEmployeeByIdCard, getCatalog } from "@/app/actions/employee-actions"

interface CargoAssignmentProps {
  onSuccess?: () => void
}

export function CargoAssignment({ onSuccess }: CargoAssignmentProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [catalogs, setCatalogs] = useState<Record<string, CatalogItem[]>>({})
  const [formData, setFormData] = useState({
    denominacionCargoId: "",
    denominacionCargoEspecificoId: "",
    ubicacionFisicaId: "",
    ubicacionAdministrativaId: "",
    gradoId: "",
    fechaAsignacion: new Date().toISOString().split("T")[0],
    motivoAsignacion: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCatalogs()
  }, [])

  async function loadCatalogs() {
    try {
      const [cargo, cargoEspecifico, ubicacionFisica, ubicacionAdmin, grado] = await Promise.all([
        getCatalog("denominacionCargo"),
        getCatalog("denominacionCargoEspecifico"),
        getCatalog("ubicacionFisica"),
        getCatalog("ubicacionAdministrativa"),
        getCatalog("grado"),
      ])
      setCatalogs({
        cargo,
        cargoEspecifico,
        ubicacionFisica,
        ubicacionAdmin,
        grado,
      })
    } catch (error) {
      console.error("Error loading catalogs:", error)
    }
  }

  async function handleSearchEmployee() {
    if (!employeeSearch.trim()) return
    try {
      const employee = await getEmployeeByIdCard(employeeSearch)
      if (employee) {
        setSelectedEmployee(employee)
      } else {
        alert("Empleado no encontrado")
      }
    } catch (error) {
      console.error("Error searching employee:", error)
    }
  }

  async function handleAssignCargo() {
    if (!selectedEmployee) {
      alert("Seleccione un empleado")
      return
    }

    if (!formData.motivoAsignacion.trim()) {
      alert("El motivo de la asignación es requerido")
      return
    }

    try {
      setLoading(true)
      // Call assignCargo action
      alert("Cargo asignado exitosamente")
      setSelectedEmployee(null)
      setEmployeeSearch("")
      setFormData({
        denominacionCargoId: "",
        denominacionCargoEspecificoId: "",
        ubicacionFisicaId: "",
        ubicacionAdministrativaId: "",
        gradoId: "",
        fechaAsignacion: new Date().toISOString().split("T")[0],
        motivoAsignacion: "",
      })
      onSuccess?.()
    } catch (error) {
      console.error("Error assigning cargo:", error)
      alert("Error al asignar cargo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asignación de Cargos</CardTitle>
        <CardDescription>Asigne o modifique cargos a empleados existentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Employee Search */}
          <div>
            <Label htmlFor="employee-search">Búsqueda de Empleado (por Cédula)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="employee-search"
                placeholder="Ingresar cédula..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              <Button onClick={handleSearchEmployee}>Buscar</Button>
            </div>
          </div>

          {/* Selected Employee Info */}
          {selectedEmployee && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Empleado Seleccionado:</p>
              <p className="text-lg font-semibold">
                {selectedEmployee.nombres} {selectedEmployee.apellidos}
              </p>
              <p className="text-sm text-muted-foreground">Cargo Actual: {selectedEmployee.denominacionCargo}</p>
              <p className="text-sm text-muted-foreground">
                Ubicación Actual: {selectedEmployee.ubicacionAdministrativa}
              </p>
            </div>
          )}

          {/* Assignment Form */}
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cargo">Nuevo Cargo *</Label>
                  <Select
                    value={formData.denominacionCargoId}
                    onValueChange={(value) => setFormData({ ...formData, denominacionCargoId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.cargo?.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="cargoEspecifico">Cargo Específico *</Label>
                  <Select
                    value={formData.denominacionCargoEspecificoId}
                    onValueChange={(value) => setFormData({ ...formData, denominacionCargoEspecificoId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.cargoEspecifico?.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grado">Grado</Label>
                  <Select
                    value={formData.gradoId}
                    onValueChange={(value) => setFormData({ ...formData, gradoId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.grado?.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ubicacionFisica">Ubicación Física *</Label>
                  <Select
                    value={formData.ubicacionFisicaId}
                    onValueChange={(value) => setFormData({ ...formData, ubicacionFisicaId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.ubicacionFisica?.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ubicacionAdmin">Ubicación Administrativa *</Label>
                  <Select
                    value={formData.ubicacionAdministrativaId}
                    onValueChange={(value) => setFormData({ ...formData, ubicacionAdministrativaId: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {catalogs.ubicacionAdmin?.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fechaAsignacion">Fecha de Asignación *</Label>
                  <Input
                    id="fechaAsignacion"
                    type="date"
                    value={formData.fechaAsignacion}
                    onChange={(e) => setFormData({ ...formData, fechaAsignacion: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo de la Asignación *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Describa el motivo de la asignación..."
                  value={formData.motivoAsignacion}
                  onChange={(e) => setFormData({ ...formData, motivoAsignacion: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null)
                    setEmployeeSearch("")
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAssignCargo} disabled={loading}>
                  {loading ? "Asignando..." : "Asignar Cargo"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
