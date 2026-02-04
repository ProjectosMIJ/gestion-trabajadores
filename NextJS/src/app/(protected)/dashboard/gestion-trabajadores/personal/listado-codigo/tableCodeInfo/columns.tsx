"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Code, InfoCode } from "@/app/types/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const columnsCode: ColumnDef<Code>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "codigo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Codigo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "denominacioncargo.cargo",
    header: "D.  Cargo",
  },
  {
    accessorKey: "denominacioncargoespecifico.cargo",
    header: "D.  Cargo Especifico",
  },
  {
    accessorKey: "grado.grado",
    header: "Grado",
    cell: ({ getValue }) => {
      const grado = getValue();
      if (!grado) return "N/A";
      return grado;
    },
  },
  {
    accessorKey: "tiponomina.nomina",
    header: "Nomina",
  },
  {
    accessorKey: "OrganismoAdscrito.Organismoadscrito",
    header: "Grado",
    cell: ({ getValue }) => {
      const orgAds = getValue();
      if (!orgAds) return "N/A";
      return orgAds;
    },
  },
  {
    accessorKey: "DireccionGeneral.direccion_general",
    header: "Direccion General",
  },
  {
    accessorKey: "DireccionLinea.direccion_linea",
    header: "Direccion De Linea",
    cell: ({ getValue }) => {
      const dirLine = getValue();
      if (!dirLine) return "N/A";
      return dirLine;
    },
  },
  {
    accessorKey: "Coordinacion.coordinacion",
    header: "Coordinacion",
    cell: ({ getValue }) => {
      const coord = getValue();
      if (!coord) return "N/A";
      return coord;
    },
  },
  {
    accessorKey: "estatusid.estatus",
    header: "Estatus",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      if (status == "VACANTE")
        return (
          <Badge variant={"default"} className="bg-green-700">
            {status}
          </Badge>
        );
      return <Badge variant={"destructive"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "fecha_actualizacion",
    header: "F. Actualizacion",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      if (!date) return "N/A";
      return format(new Date(date), "dd/MM/YYY");
    },
  },
];
