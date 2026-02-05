"use client";
import { EmployeeData } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "./data-table-column-header";

import ExportButton from "@/components/ui/ExportButtonPDF";
import { ReportPDFEmployee } from "../../../reportes/empleados/pdf/reportEmployeePDF";
import DetailInfoEmployee from "./detail-info";
import { format } from "date-fns";
import useSWR from "swr";
import { useMemo } from "react";
import { imageProfileFn } from "../../../api/getInfoRac";
export const columns: ColumnDef<EmployeeData>[] = [
  {
    accessorKey: "cedulaidentidad",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cedula" />
    ),
  },
  {
    accessorKey: "nombres",
    header: "Nombres",
  },
  {
    accessorKey: "apellidos",
    header: "Apellidos",
  },
  {
    accessorKey: "sexo.sexo",
    header: "Sexo",
  },
  {
    accessorKey: "fecha_nacimiento",
    header: "F. Nacimiento",
    cell: ({ getValue }) => {
      const fecha = getValue() as string;
      return (
        <span> {fecha ? format(new Date(fecha), "dd/MM/yyy") : "N/A"}</span>
      );
    },
  },
  {
    accessorKey: "n_contrato",
    header: "N. De Ingreso",
    cell: ({ getValue }) => {
      const numero = getValue();
      return <span>{numero ? numero.toString() : "N/A"}</span>;
    },
  },
  {
    accessorKey: "fechaingresoorganismo",
    header: "F. Ingreso Al Organismo",
    cell: ({ getValue }) => {
      const fecha = getValue() as string;
      return (
        <span> {fecha ? format(new Date(fecha), "dd/MM/yyy") : "N/A"}</span>
      );
    },
  },

  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const employee = row.original;
      const { data: profileBlob } = useSWR(
        employee.cedulaidentidad ? ["profile", employee.cedulaidentidad] : null,
        () => imageProfileFn(employee.cedulaidentidad),
      );
      const imageUrl = useMemo(() => {
        if (!profileBlob) return "/bg.png";
        return URL.createObjectURL(profileBlob);
      }, [profileBlob]);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(employee.cedulaidentidad)
              }
            >
              Copiar Cedula De Identidad
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Extras</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <ExportButton
                className="w-full"
                fileName={`${employee.nombres}-${employee.apellidos}-expediente.pdf`}
                document={
                  <ReportPDFEmployee
                    employeeData={[employee]}
                    photoUrl={imageUrl}
                    id="Sistema"
                  />
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <DetailInfoEmployee employee={employee} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
