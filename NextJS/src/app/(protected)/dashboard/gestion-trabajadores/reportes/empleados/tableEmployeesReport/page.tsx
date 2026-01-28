import { EmployeeData } from "@/app/types/types";
import { cn } from "@/lib/utils";
import { columsReport } from "./columns";
import { DataTableReportEmployee } from "./data-table";

export default function TableEmployeeReport({
  employees,
  className,
}: {
  employees: EmployeeData[];
  className?: string;
}) {
  return (
    <div className={`container mx-auto py-10 ${cn(className)}`}>
      <DataTableReportEmployee columns={columsReport} data={employees} />
    </div>
  );
}
