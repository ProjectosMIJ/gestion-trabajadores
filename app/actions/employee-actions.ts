"use server";

import type {
  Employee,
  EmployeeFilters,
  PaginatedResponse,
  CatalogItem,
  EmployeeCargoHistory,
  EmployeeEgresado,
  EmployeeFamily,
} from "@/lib/types/employee";
import type { CodigoCatalog } from "@/lib/types/codigo";

// Mock data - Replace with actual database calls
const mockEmployees = [
  {
    codigo: "EMP001",
    cedulaIdentidad: "V-12345678",
    nombres: "Juan",
    apellidos: "Pérez",
    fechaIngresoOrganismo: new Date("2020-01-15"),
    fechaIngresoAPN: new Date("2020-01-15"),
    denominacionCargoId: 1,
    denominacionCargoEspecificoId: 1,
    estatusId: 1,
    gradoId: 1,
    sexoId: 1,
    tipoNominaId: 1,
    ubicacionAdministrativaId: 1,
    ubicacionFisicaId: 1,
    denominacionCargo: "Gerente",
    denominacionCargoEspecifico: "Gerente General",
    estatus: "Activo",
    ubicacionAdministrativa: "Oficina de gestion humana",
    ubicacionFisica: "Oficina de gestion humana",
    tipoNomina: "Empleado",
    estado: "Miranda",
    municipio: "Paz Castillo",
    parroquia: "Santa Lucia del Tuy",
    numeroContrato: "N324",
    direccionDetallada:
      "Santa Lucia del Tuy, calle principal el nuevo amanacer casa 7B",
  },
  {
    codigo: "EMP002",
    cedulaIdentidad: "V-87654321",
    nombres: "María",
    apellidos: "González",
    fechaIngresoOrganismo: new Date("2021-06-20"),
    fechaIngresoAPN: new Date("2020-01-15"),
    denominacionCargoId: 2,
    denominacionCargoEspecificoId: 2,
    estatusId: 1,
    gradoId: 2,
    sexoId: 2,
    tipoNominaId: 1,
    ubicacionAdministrativaId: 2,
    ubicacionFisicaId: 2,
    denominacionCargo: "Analista",
    denominacionCargoEspecifico: "Analista de Sistemas",
    estatus: "Activo",
    ubicacionAdministrativa: "Oficina de gestion humana",
    ubicacionFisica: "Oficina de gestion humana",
    tipoNomina: "Contratado",
    estado: "Miranda",
    municipio: "Paz Castillo",
    parroquia: "Santa Lucia del Tuy",
    numeroContrato: "N124",
    direccionDetallada:
      "Santa Lucia del Tuy, calle principal el nuevo amanacer casa 7B",
  },
];

const mockCodigoCatalogo: CodigoCatalog[] = [
  {
    id: 1,
    codigo: "ADMIN-001",
    denominacionCargo: "Gerente Administrativo",
    denominacionCargoEspecifico: "Gerente de Administración",
    ubicacionFisica: "Oficina Central",
    ubicacionAdministrativa: "Caracas",
    tipoNomina: "Empleado",
    estatus: "activo",
    descripcion: "Posición gerencial administrativa",
  },
  {
    id: 2,
    codigo: "TECH-001",
    denominacionCargo: "Analista de Sistemas",
    denominacionCargoEspecifico: "Analista Senior",
    ubicacionFisica: "Recursos Humanos",
    ubicacionAdministrativa: "Valencia",
    tipoNomina: "Contratado",
    estatus: "activo",
    descripcion: "Posición técnica de análisis",
  },
  {
    id: 3,
    codigo: "HR-001",
    denominacionCargo: "Especialista RRHH",
    denominacionCargoEspecifico: "Especialista en Gestión de Personal",
    ubicacionFisica: "Recursos Humanos",
    ubicacionAdministrativa: "Caracas",
    tipoNomina: "Confianza",
    estatus: "activo",
    descripcion: "Posición de recursos humanos",
  },
];

const mockCatalogos = {
  estatus: [
    { id: 1, nombre: "Activo", descripcion: "Empleado activo" },
    { id: 2, nombre: "Bloqueado", descripcion: "Empleado Bloqueado" },
    { id: 3, nombre: "Egresado", descripcion: "Ha egresado" },
  ],
  tipoNomina: [
    { id: 1, nombre: "Permanente", descripcion: "Nómina permanente" },
    { id: 2, nombre: "Temporal", descripcion: "Nómina temporal" },
  ],
  ubicacionAdministrativa: [
    { id: 1, nombre: "Caracas", descripcion: "Oficina central" },
    { id: 2, nombre: "Valencia", descripcion: "Oficina regional" },
    { id: 3, nombre: "Maracaibo", descripcion: "Oficina regional" },
  ],
  denominacionCargo: [
    { id: 1, nombre: "Gerente", descripcion: "Puesto gerencial" },
    { id: 2, nombre: "Analista", descripcion: "Puesto analítico" },
    { id: 3, nombre: "Asistente", descripcion: "Puesto de asistencia" },
  ],
  codigo: mockCodigoCatalogo,
};

// Employee CRUD actions

export async function getEmployeeByIdCard(cedulaIdentidad: string) {
  return (
    mockEmployees.find((e) => e.cedulaIdentidad === cedulaIdentidad) || null
  );
}

export async function updateEmployee(
  cedula: string,
  data: Partial<Employee>
): Promise<Employee | null> {
  const index = mockEmployees.findIndex((e) => e.cedulaIdentidad === cedula);
  if (index === -1) return null;

  mockEmployees[index] = { ...mockEmployees[index], ...data };
  return mockEmployees[index];
}

// Cargo History actions
export async function getCargoHistory(
  cedulaIdentidad?: string
): Promise<EmployeeCargoHistory[]> {
  const mockHistory: EmployeeCargoHistory[] = [
    {
      id: 1,
      empleadoCedula: "V-12345678",
      empleadoNombre: "Juan Pérez",
      fechaModificacion: new Date("2023-06-10"),
      modificadoPor: "Admin",
      prev_denominacioncargoid: 3,
      new_denominacioncargoid: 1,
      prev_tiponominaid: 2,
      new_tiponominaid: 1,
      new_denominacioncargoespecificoid: 1,
      new_ubicacionadministrativaid: 1,
      new_ubicacionfisicaid: 1,
      new_estatusid: 1,
    },
  ];

  if (cedulaIdentidad) {
    return mockHistory.filter((h) => h.empleadoCedula === cedulaIdentidad);
  }

  return mockHistory;
}

export async function registerCargoMovement(
  data: Omit<
    EmployeeCargoHistory,
    | "id"
    | "fechaModificacion"
    | "prev_denominacioncargoid"
    | "prev_denominacioncargoespecificoid"
    | "prev_tiponominaid"
    | "prev_ubicacionadministrativaid"
    | "prev_ubicacionfisicaid"
    | "prev_estatusid"
  >
): Promise<EmployeeCargoHistory> {
  const employee = await getEmployeeByIdCard(data.empleadoCedula);
  if (!employee) throw new Error("Empleado no encontrado");

  // Create movement record with previous values
  const movement: EmployeeCargoHistory = {
    id: Date.now(),
    empleadoCedula: data.empleadoCedula,
    empleadoNombre: `${employee.nombres} ${employee.apellidos}`,
    fechaModificacion: new Date(),
    modificadoPor: data.modificadoPor,
    prev_denominacioncargoid: employee.denominacionCargoId,
    prev_denominacioncargoespecificoid: employee.denominacionCargoEspecificoId,
    prev_tiponominaid: employee.tipoNominaId,
    prev_ubicacionadministrativaid: employee.ubicacionAdministrativaId,
    prev_ubicacionfisicaid: employee.ubicacionFisicaId,
    prev_estatusid: employee.estatusId,
    ...data,
  };

  // Update employee with new values
  await updateEmployee(data.empleadoCedula, {
    denominacionCargoId: data.new_denominacioncargoid,
    denominacionCargoEspecificoId: data.new_denominacioncargoespecificoid,
    tipoNominaId: data.new_tiponominaid,
    ubicacionAdministrativaId: data.new_ubicacionadministrativaid,
    ubicacionFisicaId: data.new_ubicacionfisicaid,
    estatusId: data.new_estatusid,
  });

  return movement;
}

// Egreso actions
export async function getEgresados(): Promise<EmployeeEgresado[]> {
  return [
    {
      id: 1,
      cedulaIdentidad: "V-11111111",
      nombres: "Carlos",
      apellidos: "López",
      fechaIngresoOrganismo: new Date("2015-03-01"),
      fechaEgreso: new Date("2024-01-15"),
      motivoEgreso: "Jubilación",
      ubicacionAdministrativa: "Caracas",
      denominacionCargo: "Gerente",
    },
  ];
}

export async function registerEgreso(
  cedulaIdentidad: string,
  motivoEgreso: string
): Promise<EmployeeEgresado> {
  const employee = await getEmployeeByIdCard(cedulaIdentidad);
  if (!employee) throw new Error("Empleado no encontrado");

  const egresado: EmployeeEgresado = {
    id: Date.now(),
    cedulaIdentidad,
    nombres: employee.nombres,
    apellidos: employee.apellidos,
    fechaIngresoOrganismo: employee.fechaIngresoOrganismo,
    fechaEgreso: new Date(),
    motivoEgreso,
    ubicacionAdministrativa: employee.ubicacionAdministrativa,
    denominacionCargo: employee.denominacionCargo,
  };

  // Mark employee as inactive
  await updateEmployee(cedulaIdentidad, { estatusId: 3 });

  return egresado;
}

// Family actions
export async function getEmployeeFamilies(
  cedulaIdentidad: string
): Promise<EmployeeFamily[]> {
  const mockFamilies: EmployeeFamily[] = [
    {
      id: 1,
      empleadoCedula: "V-12345678",
      nombres: "Ana",
      apellidos: "Pérez",
      cedulaIdentidad: "V-98765432",
      parentescoId: 1,
      parentesco: "Cónyuge",
      sexoId: 2,
      sexo: "Femenino",
      fechaNacimiento: new Date("1985-05-10"),
    },
  ];

  return mockFamilies.filter((f) => f.empleadoCedula === cedulaIdentidad);
}

export async function addEmployeeFamily(
  data: Omit<EmployeeFamily, "id">
): Promise<EmployeeFamily> {
  return {
    id: Date.now(),
    ...data,
  };
}

// Catalog getters
export async function getCatalog(
  type: keyof typeof mockCatalogos
): Promise<CatalogItem[] | CodigoCatalog[]> {
  return mockCatalogos[type];
}
