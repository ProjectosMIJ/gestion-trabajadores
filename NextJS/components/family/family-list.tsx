"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { EmployeeFamily } from "@/lib/types/employee"
import { getEmployeeFamilies } from "@/app/actions/employee-actions"
import { Search } from "lucide-react"

interface FamilyListProps {
  employeeCedula: string
}

export function FamilyList({ employeeCedula }: FamilyListProps) {
  const [families, setFamilies] = useState<EmployeeFamily[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [employeeCedula])

  async function loadData() {
    try {
      setLoading(true)
      const data = await getEmployeeFamilies(employeeCedula)
      setFamilies(data)
    } catch (error) {
      console.error("Error loading families:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFamilies = search
    ? families.filter((f) => `${f.nombres} ${f.apellidos}`.toLowerCase().includes(search.toLowerCase()))
    : families

  return (
    <Card>
      <CardHeader>
        <CardTitle>Familiares del Empleado</CardTitle>
        <CardDescription>Dependientes registrados para este empleado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input placeholder="Buscar familiar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombres</TableHead>
                  <TableHead>Apellidos</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Parentesco</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Nacimiento</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredFamilies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No hay familiares registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFamilies.map((family) => (
                    <TableRow key={family.id}>
                      <TableCell className="font-medium">{family.nombres}</TableCell>
                      <TableCell>{family.apellidos}</TableCell>
                      <TableCell>{family.cedulaIdentidad}</TableCell>
                      <TableCell>{family.parentesco}</TableCell>
                      <TableCell>{family.sexo}</TableCell>
                      <TableCell>{new Date(family.fechaNacimiento).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {family.observaciones || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total de familiares: <span className="font-semibold text-foreground">{families.length}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
