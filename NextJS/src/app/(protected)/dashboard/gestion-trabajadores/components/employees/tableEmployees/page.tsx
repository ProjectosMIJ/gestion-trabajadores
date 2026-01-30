"use server";
import { EmployeeData } from "@/app/types/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getEmployeeData } from "../../../api/getInfoRac";
import { auth } from "#/auth";
async function getData(): Promise<EmployeeData[]> {
  const session = await auth();
  if (!session?.user) {
    return [];
  }
  const employeeData = await getEmployeeData();
  const user = session.user;
  const depId = user.dependency?.id ? Number(user.dependency.id) : null;
  const dgId = user.directionGeneral?.id
    ? Number(user.directionGeneral.id)
    : null;
  const dlId = user.direccionLine?.id ? Number(user.direccionLine.id) : null;
  const coId = user.coordination?.id ? Number(user.coordination.id) : null;

  if (user.role === "admin") {
    return employeeData.data || [];
  }
  const finalFiltered = (employeeData.data || []).filter((employee) => {
    if (!employee.asignaciones || employee.asignaciones.length === 0)
      return false;
    return employee.asignaciones.some((asig) => {
      const matchesDep = depId
        ? asig.DireccionGeneral?.dependencia?.id === depId
        : true;
      const matchesDG = dgId ? asig.DireccionGeneral?.id === dgId : true;

      const matchesDL = dlId ? asig.DireccionLinea?.id === dlId : true;

      const matchesCO = coId ? asig.Coordinacion?.id === coId : true;

      return matchesDep && matchesDG && matchesDL && matchesCO;
    });
  });

  return finalFiltered;
}

export default async function TableEmployee() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
