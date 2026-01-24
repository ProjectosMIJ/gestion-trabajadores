import { EmployeeData } from "@/app/types/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getEmployeeData } from "../../../api/getInfoRac";

async function getData(): Promise<EmployeeData[]> {
  const employeeData = await getEmployeeData();
  return employeeData.data;
}

export default async function TableEmployee() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
