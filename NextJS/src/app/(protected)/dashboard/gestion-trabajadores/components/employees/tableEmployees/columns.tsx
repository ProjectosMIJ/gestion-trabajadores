"use client";
import { Background, EmployeeData } from "@/app/types/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ambulance,
  ClipboardCheck,
  ContactRound,
  GraduationCap,
  House,
  Shirt,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "./data-table-column-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SheetContentUI,
  SheetHeaderUI,
  SheetTitleUI,
  SheetTriggerUI,
  SheetUI,
} from "@/components/ui/SheetUI";
import ExportButton from "@/components/ui/ExportButtonPDF";
import { ReportPDFEmployee } from "../../../reportes/empleados/pdf/reportEmployeePDF";
import DetailInfoEmployee from "./detail-info";
export const columns: ColumnDef<EmployeeData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

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
    accessorKey: "sex",
    header: "Sexo",
  },
  {
    accessorKey: "fecha_nacimiento",
    header: "fecha_nacimiento",
  },
  {
    accessorKey: "n_contrato",
    header: "Número De Ingreso",
  },
  {
    accessorKey: "fechaingresoorganismo",
    header: "Fecha De Ingreso Al Organismo",
  },

  {
    accessorKey: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
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
                  <ReportPDFEmployee employeeData={[employee]} id="Sistema" />
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
