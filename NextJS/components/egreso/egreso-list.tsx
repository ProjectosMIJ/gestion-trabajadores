"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmployeeEgresado } from "@/lib/types/employee"
import { getEgresados } from "@/app/actions/employee-actions"
import { Search } from "lucide-react"

export function EgresoList() {
  const [egresados, setEgresados] = useState<EmployeeEgresado[]>([])
  const [filteredEgresados, setFilteredEgresados] = useState<EmployeeEgresado[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterEgresados()
  }, [search, egresados])

  async function loadData() {
    try {
      setLoading(true)
      const data = await getEgresados()
      setEgresados(data)
    } catch (error) {
      console.error("Error loading egresados:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterEgresados() {
    if (!search) {
      setFilteredEgresados(egresados)
      return
    }

    const searchLower = search.toLowerCase()
    setFilteredEgresados(
      egresados.filter(
        (e) =>
          e.nombres.toLowerCase().includes(searchLower) ||
          e.apellidos.toLowerCase().includes(searchLower) ||
          e.cedulaIdentidad.toLowerCase().includes(searchLower),
      ),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Egresados</CardTitle>
        <CardDescription>Histórico de empleados que han egresado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre o cédula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Ingreso</TableHead>
                  <TableHead>Egreso</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredEgresados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No hay egresados registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEgresados.map((egresado) => (
                    <TableRow key={egresado.id}>
                      <TableCell className="font-medium">{egresado.cedulaIdentidad}</TableCell>
                      <TableCell>{egresado.nombres}</TableCell>
                      <TableCell>{egresado.apellidos}</TableCell>
                      <TableCell>{egresado.denominacionCargo}</TableCell>
                      <TableCell>{egresado.ubicacionAdministrativa}</TableCell>
                      <TableCell>{new Date(egresado.fechaIngresoOrganismo).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>{new Date(egresado.fechaEgreso).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell className="max-w-xs truncate">{egresado.motivoEgreso}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total de egresados: <span className="font-semibold text-foreground">{egresados.length}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
