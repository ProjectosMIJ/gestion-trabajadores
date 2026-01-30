export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type AcademyLevel = {
  id: number;
  nivelacademico: string;
};
export type AcademyLevelEmployeeData = {
  nivel_Academico_id: number;
  nivelAcademico: {
    id: number;
    nivelacademico: string;
  } | null;
  institucion: string;
  capacitacion: string;
  carrera: {
    id: number;
    nombre_carrera: string;
  } | null;
  mension: {
    id: number;
    nombre_mencion: string;
    carrera: {
      id: number;
      nombre_carrera: string;
    };
  } | null;
};
export interface Municipality {
  id: number;
  municipio: string;
  estadoid: number;
}

export type Cargo = {
  id: number;
  cargo: string;
};

export type Nomina = {
  id: number;
  nomina: string;
};

export type OrganismosAds = {
  id: number;
  Organismoadscrito: string;
};

export type Grado = {
  id: number;
  grado: string;
};

export type Status = {
  id: number;
  estatus: string;
};
export interface States {
  id: number;
  estado: string;
  Region: {
    id: number;
    region: string;
  };
}
export interface TypePerson {
  tipo_personal: string;
  id: number;
}

export interface EmployeeCargoHistory {
  empleado_cedula: string;
  puesto_codigo: string;
  fecha_movimiento: string;
  modificado_por_usuario: string;
  prev_cargo_especifico: string;
  prev_cargo_general: string;
  prev_nomina: string;
  prev_grado: string;
  prev_ubicacion_admin: string;
  prev_ubicacion_fisica: string;
  prev_estatus: string;
  new_cargo_especifico: string;
  new_cargo_general: string;
  new_nomina: string;
  new_grado: string;
  new_ubicacion_admin: string;
  new_ubicacion_fisica: string;
  new_estatus: string;
  motivo_movimiento: string;
}

export interface ErrorFetch {
  status: "Error";
  message: string;
}

export interface ReportTypePerson {
  tipo_personal: string;
  count: number;
}
export interface ReportTypeNomina {
  tiponominaid__nomina: string;
  count: number;
}

export interface BloodGroupType {
  id: number;
  GrupoSanguineo: string;
}

export interface PatologysType {
  id: number;
  patologia: string;
  categoria: {
    id: number;
    nombre_categoria: string;
  };
}
export interface DisabilitysType {
  id: number;
  discapacidad: string;
  categoria: {
    id: number;
    nombre_categoria: string;
  };
}

export interface ShirtSize {
  id: number;
  talla: string;
}
export interface PantsSize {
  id: number;
  talla: string;
}
export interface ShoesSize {
  id: number;
  talla: number;
}
export interface MaritalStatusType {
  id: number;
  estadoCivil: string;
}
export interface ParentType {
  id: number;
  descripcion_parentesco: string;
}

export interface DirectionGeneral {
  id: number;
  Codigo: string;
  direccion_general: string;
}

export interface DirectionLine {
  id: number;
  Codigo: string;
  direccion_linea: string;
}

export interface Coordination {
  id: number;
  Codigo: string;
  coordinacion: string;
}

export interface DireccionGeneral {
  id: number;
  direccion_general: string;
  dependencia: {
    id: number;
    Codigo: string;
    dependencia: string;
  };
}
export interface DireccionLinea {
  id: number;
  Codigo: string;
  direccion_linea: string;
}
export interface Coordinacion {
  id: number;
  Codigo: string;
  coordinacion: string;
}
export interface Municipality {
  id: number;
  municipio: string;
}
export interface DewllingInfo {
  estado: States;
  municipio: Municipality;
  parroquia: Parish;
  direccionExacta: string;
  condicion: {
    id: number;
    condicion: string;
  };
}
export interface HealthProfile {
  grupoSanguineo: {
    id: number;
    GrupoSanguineo: string;
  } | null;
  discapacidad:
    | {
        id: number;
        discapacidad: string;
        categoria: {
          id: number;
          nombre_categoria: string;
        };
      }[]
    | null;
  patologiasCronicas:
    | {
        id: number;
        patologia: string;
        categoria: {
          id: number;
          nombre_categoria: string;
        };
      }[]
    | null;
}

export interface Background {
  id: number;
  institucion: string | null;
  fecha_ingreso: string | null;
  fecha_egreso: string | null;
  fecha_actualizacion: string | null;
}
export interface PhysicalProfile {
  tallaCamisa: ShirtSize | null;
  tallaPantalon: PantsSize | null;
  tallaZapatos: ShoesSize | null;
}
export interface InfoCode {
  id: number;
  codigo: string;
  denominacioncargo: Cargo;
  denominacioncargoespecifico: Cargo;
  grado: Grado;
  tiponomina: Nomina;
  OrganismoAdscrito: OrganismosAds | null;
  DireccionGeneral: DireccionGeneral | null;
  DireccionLinea: DireccionLinea | null;
  Coordinacion: Coordinacion | null;
  estatusid: Status;
  observaciones: string | null;
  fecha_actualizacion: string;
}
export interface EmployeeData {
  anos_apn: number;
  id: number;
  cedulaidentidad: string;
  nombres: string;
  apellidos: string;
  profile: string;
  fecha_nacimiento: string;
  n_contrato: string;
  sexo: Sex;
  estadoCivil: StatusCivil;
  datos_vivienda: DewllingInfo;
  perfil_salud: HealthProfile;
  perfil_fisico: PhysicalProfile;
  formacion_academica: AcademyLevelEmployeeData;
  antecedentes: Background[];
  fechaingresoorganismo: string;
  fecha_actualizacion: string;
  asignaciones: InfoCode[];
}
export interface Sex {
  id: number;
  sexo: string;
}
export interface StatusCivil {
  id: number;
  estadoCivil: string;
}
export interface EmployeeInfo {
  id: number;
  cedulaidentidad: string;
  nombres: string;
  apellidos: string;
  profile: string;
  fecha_nacimiento: string;
  n_contrato: string;
  sexo: Sex;
  estadoCivil: StatusCivil;
  datos_vivienda: DewllingInfo;
  perfil_salud: HealthProfile;
  perfil_fisico: PhysicalProfile | null;
  formacion_academica: AcademyLevel;
  antecedentes: Background[];
  fecha_actualizacion: string;
}
export interface Code {
  id: number;
  codigo: string;
  denominacioncargo: Cargo;
  denominacioncargoespecifico: Cargo;
  grado: Grado | null;
  tiponomina: Nomina;
  OrganismoAdscrito: OrganismosAds | null;
  DireccionGeneral: DireccionGeneral;
  DireccionLinea: DireccionLinea | null;
  Coordinacion: Coordinacion | null;
  estatusid: Status;
  observaciones: string | null;
  fecha_actualizacion: string;
}
export interface ReportStatus {
  estatusid__estatus: string;
  count: number;
}
export interface Carrera {
  id: number;
  nombre_carrera: string;
}

export interface Mencion {
  id: number;
  nombre_mencion: string;
  carrera: Carrera;
}
export interface ConditionDwelling {
  id: number;
  condicion: string;
}
export interface Parish {
  id: number;
  parroquia: string;
}

export interface Motion {
  id: number;
  movimiento: string;
}

export interface ReportConfig {
  agrupaciones: string[];
  filtros: string[];
}
export interface Dependency {
  id: number;
  Codigo: string;
  dependencia: string;
}

export interface NominaGeneral {
  id: number;
  nomina: string;
  requiere_codig: boolean;
  es_activo: boolean;
}
export interface Region {
  id: number;
  region: string;
}

export interface Family {
  cedula_empleado: string;
  nombre_empleado: string;
  sexo_empleado: Sex;
  denominacion_cargo: Cargo;
  denominacion_cargo_especifico: Cargo;
  tipo_nomina: Nomina;
  familiares: {
    id: number;
    cedulaFamiliar: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    parentesco: ParentType | null;
    fechanacimiento: string;
    sexo: Sex;
    estadoCivil: StatusCivil | null;
    mismo_ente: boolean;
    heredero: boolean;
    perfil_salud_familiar: HealthProfile | null;
    perfil_fisico_familiar: PhysicalProfile | null;
    formacion_academica_familiar: {
      nivelAcademico: AcademyLevelEmployeeData | null;
      institucion: string;
      capacitacion: string;
      carrera: Carrera | null;
      mencion: Mencion | null;
    };
    observaciones: string;
    createdat: string;
    updatedat: string;
  }[];
}
export interface TypeMovement {
  id: number;
  movimiento: string;
}
export interface Leaving {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  fechaingresoorganismo: string;
  fecha_egreso: string;
  Tipo_movimiento: TypeMovement;
  cargos: InfoCode[];
}
