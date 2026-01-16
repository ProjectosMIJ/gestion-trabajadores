"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiResponse, EmployeeCargoHistory } from "@/app/types/types";
import { getCargoHistory, getCatalog } from "@/app/actions/employee-actions";
import { MoveRight, Search } from "lucide-react";
import { getHistoryMoveEmploye } from "@/app/api/getInfoRac";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";

export function MovementHistory() {
  const [movements, setMovements] = useState<EmployeeCargoHistory[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<
    EmployeeCargoHistory[]
  >([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMovements();
  }, [search, movements]);

  async function loadData() {
    try {
      setLoading(true);
    } catch (error) {
      console.error("Error loading movement history:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterMovements() {
    if (!search) {
      setFilteredMovements(movements);
      return;
    }

    const searchLower = search.toLowerCase();
    setFilteredMovements(
      movements.filter((m) =>
        m.empleado_cedula?.toLowerCase().includes(searchLower)
      )
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimientos</CardTitle>
        <CardDescription>
          Registro de cambios de cargo, ubicación y tipo de nómina
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nombre o cédula..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <Button
              variant="outline"
              onClick={async () => {
                const historyData = await getHistoryMoveEmploye(search);
                setMovements(historyData.data);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Cambio Realizado</TableHead>
                  <TableHead>Anterior → Nuevo</TableHead>
                  <TableHead>Fecha Modificación</TableHead>
                  <TableHead>Modificado Por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No hay movimientos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={Math.random()}>
                      <TableCell>{movement.empleado_cedula}</TableCell>
                      <TableCell className="w-40  grid grid-cols-2">
                        {movement.prev_cargo_general &&
                        movement.new_cargo_general
                          ? "Cambio de Cargo"
                          : movement.prev_ubicacion_admin &&
                            movement.new_ubicacion_admin
                          ? "Cambio de Ubicación"
                          : "Cambio Múltiple"}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline">Ver Movimientos</Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Card>
                              <CardContent className="text-2xl">
                                {movement.prev_cargo_general && (
                                  <div className="grid grid-cols-2 ">
                                    <div className="mx-6">
                                      <p className="text-red-500">
                                        Cargo Anterior:
                                      </p>
                                      {movement.prev_cargo_general}
                                    </div>
                                    <div className="mx-6">
                                      <p className="text-green-500">
                                        Nuevo Cargo:
                                      </p>
                                      {movement.new_cargo_general}
                                    </div>
                                    <div className="mx-6">
                                      <p className="text-red-500">
                                        Estatus Anterior:
                                      </p>
                                      {movement.prev_estatus}
                                    </div>
                                    <div className="mx-6">
                                      <p className="text-green-500">
                                        Estatus Nuevo:
                                      </p>
                                      {movement.new_estatus}
                                    </div>
                                  </div>
                                )}
                                {movement.prev_nomina && (
                                  <div className=" grid grid-cols-2 gap-0">
                                    <div className="mx-6">
                                      <p className="text-red-500">
                                        Nómina Anterior:
                                      </p>
                                      {movement.prev_nomina}
                                    </div>
                                    <div className="mx-6">
                                      <p className="text-green-500">
                                        Nueva Nómina:
                                      </p>
                                      {movement.new_nomina}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        {new Date(movement.fecha_movimiento).toLocaleDateString(
                          "es-ES"
                        )}
                      </TableCell>
                      <TableCell>{movement.modificado_por_usuario}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
