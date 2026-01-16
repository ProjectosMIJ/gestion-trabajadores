"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewEmployeeButton() {
  return (
    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
      <Plus className="mr-2 h-5 w-5" />
      Registrar Nuevo Trabajador
    </Button>
  );
}
