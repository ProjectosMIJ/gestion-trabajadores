"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeEditModal } from "./employee-edit-modal";
import { EmployeeDetailDrawer } from "./employee-detail-drawer";
import { Search, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { ApiResponse, EmployeeData, Status } from "@/app/types/types";

export function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [selectedEstatus, setSelectedEstatus] = useState<string>("0"); // Updated default value to '0'
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApiResponse<Status[]>>({
    status: "",
    message: "",
    data: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const responseEmployees = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}empleados-listar/`
      );
      const dataEmployees = await responseEmployees.json();
      setEmployees(dataEmployees.data);
      const status = await fetch(
        `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-estatus/`
      );
      const responseStatus: ApiResponse<Status[]> = await status.json();
      setStatus(responseStatus);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    try {
      setLoading(true);
    } catch (error) {
      console.error("Error searching employees:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleViewDetails = (employee: EmployeeData) => {
    setSelectedEmployee(employee);
    setShowDetailDrawer(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Gestión de Personal Activo
        </h1>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                Buscar por nombre o cédula
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre o cédula..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-1"
                  type="search"
                />
                <Button onClick={handleSearch} className="mt-1">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Estatus
              </label>
              <Select
                value={selectedEstatus}
                onValueChange={setSelectedEstatus}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todos</SelectItem>
                  {status.data.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.estatus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                variant="outline"
                className="w-full bg-transparent"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Activo</CardTitle>
          <CardDescription>Total: {pagination.total} empleados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="whitespace-nowrap">Cédula</TableHead>
                  <TableHead className="whitespace-nowrap">Nombres</TableHead>
                  <TableHead className="whitespace-nowrap">Apellidos</TableHead>
                  <TableHead className="whitespace-nowrap">Cargo</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Ingreso Organismo
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    Ingreso APN
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-right">
                    Detalles
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-right">
                    Accion
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No hay empleados disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow
                      key={employee.cedulaidentidad}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="whitespace-nowrap">
                        {employee.cedulaidentidad}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {employee.nombres}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {employee.apellidos}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={"Denominacion de cargo"}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button> Ver Cargos</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-fit">
                            <div className="grid gap-4 w-fit">
                              <div className="space-y-2 ">
                                <h4 className="leading-none font-medium">
                                  Cargos
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                  Las Dimensiones del cargo
                                </p>
                              </div>
                              <div className="grid gap-2 ">
                                <ScrollArea className="h-72 w-fit rounded-md ">
                                  {employee.asignaciones.map(
                                    (asignacion, i) => (
                                      <div className="grid grid-cols-2 gap-1 items-center">
                                        <div className="w-full">Codigo</div>
                                        <div className=" w-full">
                                          {asignacion.codigo === ""
                                            ? "N/A"
                                            : asignacion.codigo}
                                        </div>
                                        <div className="w-full">
                                          Denominacion de Cargo
                                        </div>
                                        <div className=" w-full">
                                          {asignacion.denominacioncargo.cargo}
                                        </div>
                                        <div className="w-full">
                                          Denominacion de Cargo Especifico
                                        </div>
                                        <div className=" w-full">
                                          {
                                            asignacion
                                              .denominacioncargoespecifico.cargo
                                          }
                                        </div>

                                        <div className="w-full">estatus</div>
                                        <div className=" w-full">
                                          {asignacion.estatusid.estatus}
                                        </div>

                                        <div className="w-full">Grado</div>
                                        <div className=" w-full">
                                          {asignacion.grado.grado === ""
                                            ? "N/A"
                                            : asignacion.grado.grado}
                                        </div>

                                        <div className="w-full">
                                          Tipo de Nomina
                                        </div>
                                        <div className=" w-full">
                                          {asignacion.tiponomina.nomina}
                                        </div>

                                        <div className="w-full">
                                          Organismo Adscrito
                                        </div>
                                        <div className=" w-full">
                                          {asignacion.OrganismoAdscrito.Organismoadscrito 
                                            ? asignacion.OrganismoAdscrito.Organismoadscrito
                                            :"N/A" }
                                        </div>
                                        <div className="w-full">
                                          Direccion General
                                        </div>
                                        <div className=" w-full">
                                          {
                                            asignacion.DireccionGeneral
                                              .direccion_general
                                          }
                                        </div>
                                        <div className="w-full">
                                          Direccion De Linea
                                        </div>
                                        <div className=" w-full">
                                          {
                                            asignacion.DireccionLinea
                                              ?.direccion_linea
                                          }
                                        </div>
                                         <div className="w-full">
                                          Coordinacion
                                        </div>
                                        <div className=" w-full">
                                          {asignacion.Coordinacion?.coordinacion}
                                        </div>

                                        <div className="col-span-2 m-auto">
                                          {asignacion.observaciones === ""
                                            ? "Sin Observaciones"
                                            : asignacion.observaciones}
                                        </div>
                                        <Separator className="w-full col-span-2 mt-5 mb-5  " />
                                      </div>
                                    )
                                  )}
                                </ScrollArea>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {employee.fechaingresoorganismo}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {employee.fechaingresoapn}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(employee)}
                          className="gap-1"
                        >
                          <ChevronDown className="h-4 w-4" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(employee)}
                          className="gap-1"
                        >
                          <ChevronDown className="h-4 w-4" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals and Drawers */}
      {selectedEmployee && (
        <>
          <EmployeeDetailDrawer
            employee={selectedEmployee}
            isOpen={showDetailDrawer}
            onClose={() => {
              setShowDetailDrawer(false);
              setSelectedEmployee(null);
            }}
          />
          <EmployeeEditModal
            employee={selectedEmployee}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEmployee(null);
              loadData();
            }}
          />
        </>
      )}
    </div>
  );
}
