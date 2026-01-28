import { Leaving } from "@/app/types/types";
import { columnsLeavingReport } from "./columns";
import { DataTableLeaving } from "./data-table";

export default function TableReportLeaving({
  leaving,
}: {
  leaving: Leaving[];
}) {
  return (
    <div className="container mx-auto py-10">
      <DataTableLeaving columns={columnsLeavingReport} data={leaving} />
    </div>
  );
}
