"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CatalogItem, EmployeeFamily } from "@/lib/types/employee"
import { addEmployeeFamily } from "@/app/actions/employee-actions"

interface FamilyRegisterProps {
  employeeCedula: string
  onSuccess?: () => void
}

export function FamilyRegister({ employeeCedula, onSuccess }: FamilyRegisterProps) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    cedulaIdentidad: "",
    parentescoId: "",
    sexoId: "",
    fechaNacimiento: "",
    observaciones: "",
  })
  const [catalogs, setCatalogs] = useState<Record<string, CatalogItem[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadCatalogs()
  }, [])

  async function loadCatalogs() {
    try {
      // Mock catalogs for parentescos and sexo
      setCatalogs({
        parentesco: [
          { id: 1, nombre: "Cónyuge", descripcion: "Esposo/Esposa" },
          { id: 2, nombre: "Hijo", descripcion: "Hijo/Hija" },
          { id: 3, nombre: "Padre", descripcion: "Padre/Madre" },
          { id: 4, nombre: "Hermano", descripcion: "Hermano/Hermana" },
        ],
        sexo: [
          { id: 1, nombre: "Masculino", descripcion: "Masculino" },
          { id: 2, nombre: "Femenino", descripcion: "Femenino" },
        ],
      })
    } catch (error) {
      console.error("Error loading catalogs:", error)
    }
  }

  async function handleAddFamily() {
    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      setError("Ingrese nombres y apellidos")
      return
    }

    if (!formData.parentescoId || !formData.sexoId) {
      setError("Seleccione parentesco y sexo")
      return
    }

    try {
      setLoading(true)
      setError("")

      const familyData: Omit<EmployeeFamily, "id"> = {
        empleadoCedula: employeeCedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        cedulaIdentidad: formData.cedulaIdentidad,
        parentescoId: Number.parseInt(formData.parentescoId),
        sexoId: Number.parseInt(formData.sexoId),
        fechaNacimiento: new Date(formData.fechaNacimiento),
        observaciones: formData.observaciones,
      }

      await addEmployeeFamily(familyData)
      alert("Familiar agregado exitosamente")
      setFormData({
        nombres: "",
        apellidos: "",
        cedulaIdentidad: "",
        parentescoId: "",
        sexoId: "",
        fechaNacimiento: "",
        observaciones: "",
      })
      onSuccess?.()
    } catch (err) {
      setError("Error al agregar familiar")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nuevo Familiar</CardTitle>
        <CardDescription>Registre un familiar para el empleado seleccionado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nombres">Nombres</Label>
              <Input
                id="nombres"
                placeholder="Nombres del familiar"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                placeholder="Apellidos del familiar"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="cedula">Cédula de Identidad</Label>
              <Input
                id="cedula"
                placeholder="V-12345678"
                value={formData.cedulaIdentidad}
                onChange={(e) => setFormData({ ...formData, cedulaIdentidad: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="parentesco">Parentesco</Label>
              <Select
                value={formData.parentescoId}
                onValueChange={(value) => setFormData({ ...formData, parentescoId: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.parentesco?.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <Select value={formData.sexoId} onValueChange={(value) => setFormData({ ...formData, sexoId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {catalogs.sexo?.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              placeholder="Notas adicionales..."
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={handleAddFamily} disabled={loading}>
              {loading ? "Agregando..." : "Agregar Familiar"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
