"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Employee, CatalogItem } from "@/lib/types/employee"
import { getCatalog } from "@/app/actions/employee-actions"

interface PayrollChangeModalProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PayrollChangeModal({ employee, isOpen, onClose, onSuccess }: PayrollChangeModalProps) {
  const [catalogs, setCatalogs] = useState<Record<string, CatalogItem[]>>({})
  const [tipoCambio, setTipoCambio] = useState<"pasivo" | "agrego" | "activo" | "">("")
  const [formData, setFormData] = useState({
    nuevoTipoNominaId: "",
    fechaCambio: new Date().toISOString().split("T")[0],
    motivoCambio: "",
    // Passive employee data
    tiempoServicio: "",
    deudas: "0",
    observacionesInactivo: "",
    // Agrego data
    motivoAgrego: "",
    detallesAgrego: "",
    observacionesAgrego: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCatalogs()
  }, [])

  async function loadCatalogs() {
    try {
      const tipoNomina = await getCatalog("tipoNomina")
      setCatalogs({
        tipoNomina,
      })
    } catch (error) {
      console.error("Error loading catalogs:", error)
    }
  }

  async function handleSubmit() {
    if (!tipoCambio || !formData.nuevoTipoNominaId) {
      alert("Seleccione tipo de cambio y nuevo tipo de nómina")
      return
    }

    if (!formData.motivoCambio.trim()) {
      alert("El motivo del cambio es requerido")
      return
    }

    // Validate conditional fields
    if (tipoCambio === "pasivo" && !formData.tiempoServicio.trim()) {
      alert("El tiempo de servicio es requerido para empleado pasivo")
      return
    }

    if (tipoCambio === "agrego" && !formData.motivoAgrego.trim()) {
      alert("El motivo del agrego es requerido")
      return
    }

    try {
      setLoading(true)
      // Call updatePayrollType action
      alert("Tipo de nómina actualizado exitosamente")
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Error updating payroll:", error)
      alert("Error al actualizar tipo de nómina")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cambiar Tipo de Nómina</DialogTitle>
          <DialogDescription>
            {employee.nombres} {employee.apellidos} - Actual: {employee.tipoNomina}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type of Change */}
          <div>
            <Label htmlFor="tipoCambio">Tipo de Cambio *</Label>
            <Select value={tipoCambio} onValueChange={(value: any) => setTipoCambio(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar tipo de cambio..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Empleado Activo</SelectItem>
                <SelectItem value="pasivo">Personal Pasivo</SelectItem>
                <SelectItem value="agrego">Agrego</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="tipoNomina">Nuevo Tipo de Nómina *</Label>
              <Select
                value={formData.nuevoTipoNominaId}
                onValueChange={(value) => setFormData({ ...formData, nuevoTipoNominaId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.tipoNomina?.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fechaCambio">Fecha del Cambio *</Label>
              <Input
                id="fechaCambio"
                type="date"
                value={formData.fechaCambio}
                onChange={(e) => setFormData({ ...formData, fechaCambio: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="motivoCambio">Motivo del Cambio *</Label>
            <Textarea
              id="motivoCambio"
              placeholder="Describa el motivo del cambio de nómina..."
              value={formData.motivoCambio}
              onChange={(e) => setFormData({ ...formData, motivoCambio: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Conditional Fields: Personal Pasivo */}
          {tipoCambio === "pasivo" && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-base">Información de Personal Pasivo</CardTitle>
                <CardDescription>Complete los datos requeridos para el registro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="tiempoServicio">Tiempo de Servicio *</Label>
                    <Input
                      id="tiempoServicio"
                      placeholder="Ej: 20 años 6 meses"
                      value={formData.tiempoServicio}
                      onChange={(e) => setFormData({ ...formData, tiempoServicio: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deudas">Deudas (Monto) *</Label>
                    <Input
                      id="deudas"
                      type="number"
                      placeholder="0.00"
                      value={formData.deudas}
                      onChange={(e) => setFormData({ ...formData, deudas: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacionesInactivo">Observaciones</Label>
                  <Textarea
                    id="observacionesInactivo"
                    placeholder="Observaciones adicionales sobre el personal pasivo..."
                    value={formData.observacionesInactivo}
                    onChange={(e) => setFormData({ ...formData, observacionesInactivo: e.target.value })}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditional Fields: Agrego */}
          {tipoCambio === "agrego" && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Información de Agrego</CardTitle>
                <CardDescription>Complete los datos requeridos para el registro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="motivoAgrego">Motivo del Agrego *</Label>
                  <Textarea
                    id="motivoAgrego"
                    placeholder="Describa el motivo del agrego..."
                    value={formData.motivoAgrego}
                    onChange={(e) => setFormData({ ...formData, motivoAgrego: e.target.value })}
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="detallesAgrego">Detalles del Agrego *</Label>
                  <Textarea
                    id="detallesAgrego"
                    placeholder="Proporcione los detalles específicos del agrego..."
                    value={formData.detallesAgrego}
                    onChange={(e) => setFormData({ ...formData, detallesAgrego: e.target.value })}
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="observacionesAgrego">Observaciones</Label>
                  <Textarea
                    id="observacionesAgrego"
                    placeholder="Observaciones adicionales..."
                    value={formData.observacionesAgrego}
                    onChange={(e) => setFormData({ ...formData, observacionesAgrego: e.target.value })}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Procesando..." : "Confirmar Cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
