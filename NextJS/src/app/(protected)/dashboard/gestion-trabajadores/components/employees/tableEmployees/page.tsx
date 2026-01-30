"use server";
import { EmployeeData } from "@/app/types/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getEmployeeData } from "../../../api/getInfoRac";
import { auth } from "#/auth";
async function getData(): Promise<EmployeeData[]> {
  const session = await auth();
  if (!session || !session.user?.id) {
    return [];
  }
  const employeeData = await getEmployeeData();
  const directionGeneralId = Number(session.user.directionGeneral.id);
  const directionLineId = session.user.direccionLine
    ? Number(session.user.direccionLine.id)
    : null;
  const coordinationId = session.user.coordination
    ? Number(session.user.coordination.id)
    : null;
  const finalFiltered = employeeData.data.filter((v) =>
    v.asignaciones?.some((asignacion) => {
      const matchesDirectionGeneral =
        asignacion.DireccionGeneral?.id === directionGeneralId;
      const matchesDirectionLine = directionLineId
        ? asignacion.DireccionLinea?.id === directionLineId
        : true;
      const matchesCoordination = coordinationId
        ? asignacion.Coordinacion?.id === coordinationId
        : true;

      return (
        matchesDirectionGeneral && matchesDirectionLine && matchesCoordination
      );
    }),
  );

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
