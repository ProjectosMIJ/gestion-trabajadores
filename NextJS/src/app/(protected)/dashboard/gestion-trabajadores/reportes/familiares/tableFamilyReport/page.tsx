"use client";
import { Family } from "@/app/types/types";
import { columnsFamily } from "./columns";
import { DataTableFamily } from "./data-table";
import { useMemo } from "react";

export default function ReportFamilyTable({ familys }: { familys: Family[] }) {
  const safeData = useMemo(
    () => (familys || []).map((v) => v.familiares || []).flat(),
    [familys],
  );
  return (
    <div
      className="container mx-a
    uto py-10"
    >
      <DataTableFamily columns={columnsFamily} data={safeData} />
    </div>
  );
}
