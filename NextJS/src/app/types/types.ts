export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export type AcademyLevel = {
  id: number;
  nivelacademico: string;
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

export type UbicacionFisica = {
  id: number;
  ubicacionfisica: string;
};

export type UbicacionAdministrativa = {
  id: number;
  ubicacionadministrativa: string;
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
  Codigo: string;
  direccion_general: string;
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

export interface EmployeeData {
  id: number;
  cedulaidentidad: string;
  nombres: string;
  apellidos: string;
  sexo: Sex;
  nivelAcademico: AcademyLevel;
  estado: States;
  municipio: Municipality;
  parroquia: Parish;
  direccion_exacta: string;
  fecha_nacimiento: string;
  fechaingresoorganismo: string;
  fechaingresoapn: string;
  fecha_actualizacion: string;
  n_contrato: string;
  profile: string;
  vivienda: boolean;
  estadoCivil: StatusCivil;
  grupoSanguineo: BloodGroupType | null;
  patologiasCronicas: PatologysType[] | [];
  discapacidad: DisabilitysType | null;
  tallaCamisa: ShirtSize | null;
  tallaPantalon: PantsSize | null;
  tallaZapatos: ShoesSize | null;
  asignaciones: [
    {
      id: number;
      codigo: string;
      denominacioncargo: Cargo;
      denominacioncargoespecifico: Cargo;
      grado: Grado;
      tiponomina: Nomina;
      OrganismoAdscrito: OrganismosAds;
      DireccionGeneral: DireccionGeneral;
      DireccionLinea: DireccionLinea | null;
      Coordinacion: Coordinacion | null;
      estatusid: Status;
      observaciones: string | null;
      fecha_actualizacion: string;
    },
  ];
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
  sexo: Sex;
  nivelAcademico: AcademyLevel;
  estado: States;
  municipio: Municipality;
  parroquia: Parish;
  direccion_exacta: string;
  fecha_nacimiento: string;
  fechaingresoorganismo: string;
  fechaingresoapn: string;
  fecha_actualizacion: string;
  n_contrato: string;
  profile: string;
  vivienda: boolean;
  estadoCivil: StatusCivil;
  grupoSanguineo: BloodGroupType | null;
  patologiasCronicas: PatologysType[] | [];
  discapacidad: DisabilitysType | null;
  tallaCamisa: ShirtSize | null;
  tallaPantalon: PantsSize | null;
  tallaZapatos: ShoesSize | null;
}
export interface Code {
  id: number;
  codigo: string;
  denominacioncargo: Cargo;
  denominacioncargoespecifico: Cargo;
  grado: Grado | null;
  tiponomina: Nomina;
  OrganismoAdscrito: string;
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
