"use client";
import { Family } from "@/app/types/types";
import { columnsFamily } from "./columns";
import { DataTableFamily } from "./data-table";

export default function ReportFamilyTable({ familys }: { familys: Family[] }) {
  const arrayFamily = familys.map((v) => v.familiares).flat();
  return (
    <div
      className="container mx-a
    uto py-10"
    >
      <DataTableFamily columns={columnsFamily} data={arrayFamily} />
    </div>
  );
}
