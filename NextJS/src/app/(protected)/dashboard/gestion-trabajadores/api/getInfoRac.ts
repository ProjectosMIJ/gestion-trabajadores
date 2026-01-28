import {
  AcademyLevel,
  ApiResponse,
  BloodGroupType,
  Cargo,
  Carrera,
  Code,
  ConditionDwelling,
  Coordination,
  Dependency,
  DirectionGeneral,
  DirectionLine,
  DisabilitysType,
  EmployeeCargoHistory,
  EmployeeData,
  EmployeeInfo,
  ErrorFetch,
  Grado,
  MaritalStatusType,
  Mencion,
  Motion,
  Municipality,
  Nomina,
  NominaGeneral,
  OrganismosAds,
  PantsSize,
  ParentType,
  Parish,
  PatologysType,
  Region,
  ReportConfig,
  ReportStatus,
  ReportTypeNomina,
  ReportTypePerson,
  Sex,
  ShirtSize,
  ShoesSize,
  States,
  Status,
  UbicacionAdministrativa,
  UbicacionFisica,
} from "@/app/types/types";

export const getAcademyLevel = async (): Promise<
  ApiResponse<AcademyLevel[]>
> => {
  const academyLevel = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-nivel-academico`,
  );
  const responseAcademyLevel: ApiResponse<AcademyLevel[]> =
    await academyLevel.json();

  return responseAcademyLevel;
};
export const getStatus = async (): Promise<ApiResponse<Status[]>> => {
  const status = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-estatus/`,
  );
  const responseStatus: ApiResponse<Status[]> = await status.json();
  return responseStatus;
};
export const getStatusNomina = async (): Promise<ApiResponse<Status[]>> => {
  const status = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}estatus-gestion/`,
  );
  const responseStatus: ApiResponse<Status[]> = await status.json();
  return responseStatus;
};
export const getStatusEmployee = async (): Promise<ApiResponse<Status[]>> => {
  const statusEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}estatus/`,
  );
  const responseStatusEmployee: ApiResponse<Status[]> =
    await statusEmployee.json();
  return responseStatusEmployee;
};
export const getGrado = async (): Promise<ApiResponse<Grado[]>> => {
  const grado = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-grado/`,
  );
  const responseGrado: ApiResponse<Grado[]> = await grado.json();
  return responseGrado;
};
export const getUbicacionAdministrativa = async (): Promise<
  ApiResponse<UbicacionAdministrativa[]>
> => {
  const ubicacionAdministrativa = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-ubicacion-administrativa/`,
  );
  const responseUbicacionAdministrativa: ApiResponse<
    UbicacionAdministrativa[]
  > = await ubicacionAdministrativa.json();
  return responseUbicacionAdministrativa;
};
export const getUbicacionFisica = async (): Promise<
  ApiResponse<UbicacionFisica[]>
> => {
  const ubicacionFisica = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-ubicacion-fisica/`,
  );
  const responseUbicacionFisica: ApiResponse<UbicacionFisica[]> =
    await ubicacionFisica.json();
  return responseUbicacionFisica;
};
export const getOrganismosAds = async (): Promise<
  ApiResponse<OrganismosAds[]>
> => {
  const organismosAdscritos = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}organismos-adscritos/`,
  );
  const responseOrganismosAdscritos: ApiResponse<OrganismosAds[]> =
    await organismosAdscritos.json();
  return responseOrganismosAdscritos;
};
export const getNomina = async (): Promise<ApiResponse<Nomina[]>> => {
  const nomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-tipo-nomina/`,
  );
  const responseNomina: ApiResponse<Nomina[]> = await nomina.json();
  return responseNomina;
};
export const getNominaEspecial = async (): Promise<ApiResponse<Nomina[]>> => {
  const nomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-nomina-especial/`,
  );
  const responseNomina: ApiResponse<Nomina[]> = await nomina.json();
  return responseNomina;
};

export const getNominaPasivo = async (): Promise<ApiResponse<Nomina[]>> => {
  const nomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-nominaPasivo/`,
  );
  const responseNomina: ApiResponse<Nomina[]> = await nomina.json();
  return responseNomina;
};
export const getCargo = async (): Promise<ApiResponse<Cargo[]>> => {
  const cargo = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-denominacion-cargo/`,
  );
  const responseCargo: ApiResponse<Cargo[]> = await cargo.json();
  return responseCargo;
};
export const getCargoEspecifico = async (): Promise<ApiResponse<Cargo[]>> => {
  const cargoEspecifico = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-denominacion-cargo-especifico/`,
  );
  const responseCargoEspecifico: ApiResponse<Cargo[]> =
    await cargoEspecifico.json();
  return responseCargoEspecifico;
};
export const getStates = async (): Promise<ApiResponse<States[]>> => {
  const states = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/estados/`,
  );
  const responseStates: ApiResponse<States[]> = await states.json();
  return responseStates;
};
export const getMunicipalitys = async (
  id: string,
): Promise<ApiResponse<Municipality[]>> => {
  const responseMunicipalitys = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/municipios/${id}/`,
  );
  const getMunicipalitys: ApiResponse<Municipality[]> =
    await responseMunicipalitys.json();
  return getMunicipalitys;
};

export const getParish = async (id: string): Promise<ApiResponse<Parish[]>> => {
  const responseParish = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/parroquias/${id}/`,
  );
  const getParish: ApiResponse<Parish[]> = await responseParish.json();
  return getParish;
};

export const getCodigo = async (): Promise<
  ApiResponse<Code[] | ErrorFetch>
> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-codigos/`,
  );
  const getCode: ApiResponse<Code[]> = await responseCode.json();
  return getCode;
};

export const getEmployeeById = async (
  id: string,
): Promise<ApiResponse<EmployeeData>> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}empleados-cedula/${id}/`,
  );
  const getEmployee: ApiResponse<EmployeeData> = await responseEmployee.json();
  return getEmployee;
};
export const getEmployeeData = async (): Promise<
  ApiResponse<EmployeeData[]>
> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Employee/cargos/`,
  );
  const getEmployee: ApiResponse<EmployeeData[]> =
    await responseEmployee.json();
  return getEmployee;
};

export const getHistoryMoveEmploye = async (
  id: string,
): Promise<ApiResponse<EmployeeCargoHistory[]>> => {
  const responseHistoryMoveEmploye = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}historyEmployee/historial/${id}/`,
  );
  const getHistoryMoveEmploye: ApiResponse<EmployeeCargoHistory[]> =
    await responseHistoryMoveEmploye.json();
  return getHistoryMoveEmploye;
};

export const getCodeList = async (): Promise<
  ApiResponse<Code[] | ErrorFetch>
> => {
  const responseCodeList = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}codigos_lister/`,
  );
  const getCodeList: ApiResponse<Code[]> = await responseCodeList.json();
  return getCodeList;
};

export const getReportTypePerson = async (): Promise<
  ApiResponse<ReportTypePerson[]>
> => {
  const responseReportTypePerson = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}reporte-personal/`,
  );
  const getReportTypePerson: ApiResponse<ReportTypePerson[]> =
    await responseReportTypePerson.json();
  return getReportTypePerson;
};
export const getReportStatus = async (): Promise<
  ApiResponse<ReportStatus[]>
> => {
  const responseReportStatus = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}estatus/reportes/`,
  );
  const getReportStatus: ApiResponse<ReportStatus[]> =
    await responseReportStatus.json();
  return getReportStatus;
};

export const getReportTypeNomina = async (): Promise<
  ApiResponse<ReportTypeNomina[]>
> => {
  const responseReportTypeNomina = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}tiponomina/reportes/`,
  );
  const getReportTypeNomina: ApiResponse<ReportTypeNomina[]> =
    await responseReportTypeNomina.json();
  return getReportTypeNomina;
};
export const getBloodGroup = async (): Promise<
  ApiResponse<BloodGroupType[]>
> => {
  const responseBloodGroup = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-grupoSanguineos/`,
  );
  const getBloodGroup: ApiResponse<BloodGroupType[]> =
    await responseBloodGroup.json();
  return getBloodGroup;
};

export const getPatologys = async (): Promise<ApiResponse<PatologysType[]>> => {
  const responsePatologys = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Patologias/`,
  );
  const getPatologys: ApiResponse<PatologysType[]> =
    await responsePatologys.json();
  return getPatologys;
};

export const getDisability = async (): Promise<
  ApiResponse<DisabilitysType[]>
> => {
  const responseDisability = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Discapacidades/`,
  );
  const getDisability: ApiResponse<DisabilitysType[]> =
    await responseDisability.json();
  return getDisability;
};

export const getShirtSize = async (): Promise<ApiResponse<ShirtSize[]>> => {
  const responseShirtSize = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-tallasCamisas/`,
  );
  const getShirtSize: ApiResponse<ShirtSize[]> = await responseShirtSize.json();
  return getShirtSize;
};

export const getPantsSize = async (): Promise<ApiResponse<PantsSize[]>> => {
  const responsePantsSize = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-tallaPantalones/`,
  );
  const getPantsSize: ApiResponse<PantsSize[]> = await responsePantsSize.json();
  return getPantsSize;
};

export const getShoesSize = async (): Promise<ApiResponse<ShoesSize[]>> => {
  const responseShoesSize = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-tallaZapatos/`,
  );
  const getShoesSize: ApiResponse<ShoesSize[]> = await responseShoesSize.json();
  return getShoesSize;
};

export const getMaritalstatus = async (): Promise<
  ApiResponse<MaritalStatusType[]>
> => {
  const responseMaritalstatus = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-estadoCivil/`,
  );
  const getMaritalstatus: ApiResponse<MaritalStatusType[]> =
    await responseMaritalstatus.json();
  return getMaritalstatus;
};

export const getParent = async (): Promise<ApiResponse<ParentType[]>> => {
  const responseParent = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Parentesco/`,
  );
  const getParent: ApiResponse<ParentType[]> = await responseParent.json();
  return getParent;
};

export const getDirectionGeneral = async (): Promise<
  ApiResponse<DirectionGeneral[]>
> => {
  const responseDirectionGeneral = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-DireccionGeneral/`,
  );
  const getDirectionGeneral: ApiResponse<DirectionGeneral[]> =
    await responseDirectionGeneral.json();
  return getDirectionGeneral;
};

export const getDirectionLine = async (
  id: string,
): Promise<ApiResponse<DirectionLine[]>> => {
  const responseDirectionLine = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-DireccionLinea/${id}/`,
  );
  const getDirectionLine: ApiResponse<DirectionLine[]> =
    await responseDirectionLine.json();
  return getDirectionLine;
};

export const getCoordination = async (
  id: string,
): Promise<ApiResponse<Coordination[]>> => {
  const responseCoordination = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-Coordinacion/${id}/`,
  );
  const getCoordination: ApiResponse<Coordination[]> =
    await responseCoordination.json();
  return getCoordination;
};

export const getEmployeeInfo = async (
  id: string,
): Promise<ApiResponse<EmployeeInfo>> => {
  const responseEmployee = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-data-empleados/${id}/`,
  );
  const getEmployee: ApiResponse<EmployeeInfo> = await responseEmployee.json();
  return getEmployee;
};

export const getCodeByDirectionGeneral = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}cargo_DreccionGeneral/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};

export const getCodeByDirectionLine = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}cargo_DreccionLinea/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};

export const getCodeByCoordination = async (
  id: string,
): Promise<ApiResponse<Code[]>> => {
  const responseCode = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}cargo_coordinacion/${id}/`,
  );
  const getEmployee: ApiResponse<Code[]> = await responseCode.json();
  return getEmployee;
};

export const getCarrera = async (): Promise<ApiResponse<Carrera[]>> => {
  const responseCarrera = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}carreras/`,
  );
  const getEmployee: ApiResponse<Carrera[]> = await responseCarrera.json();
  return getEmployee;
};

export const getMencion = async (
  id: string,
): Promise<ApiResponse<Mencion[]>> => {
  const responseMencion = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}Menciones/${id}/`,
  );
  const getEmployee: ApiResponse<Mencion[]> = await responseMencion.json();
  return getEmployee;
};
export const getConditionDwelling = async (): Promise<
  ApiResponse<ConditionDwelling[]>
> => {
  const responseConditionDwelling = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}condicion_vivienda/`,
  );
  const getDewlling: ApiResponse<ConditionDwelling[]> =
    await responseConditionDwelling.json();
  return getDewlling;
};

export const getSex = async (): Promise<ApiResponse<Sex[]>> => {
  const responseSex = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}listar-sexo/`,
  );
  const getSex: ApiResponse<Sex[]> = await responseSex.json();
  return getSex;
};

export const getReasonLeaving = async (): Promise<ApiResponse<Motion[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}motivos/egreso/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getInternalReason = async (): Promise<ApiResponse<Motion[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}motivos/estatus/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getMotionReason = async (): Promise<ApiResponse<Motion[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}motivos/movimiento/`,
  );
  const getResponse: ApiResponse<Motion[]> = await response.json();
  return getResponse;
};
export const getReportConfigEmployee = async (): Promise<
  ApiResponse<ReportConfig>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}employee/reports/config/`,
  );
  const getResponse: ApiResponse<ReportConfig> = await response.json();
  return getResponse;
};
export const getReportConfigFamily = async (): Promise<
  ApiResponse<ReportConfig>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}family/reports/config/`,
  );
  const getResponse: ApiResponse<ReportConfig> = await response.json();
  return getResponse;
};
export const getReportConfigLeaving = async (): Promise<
  ApiResponse<ReportConfig>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}graduate/reports/config/`,
  );
  const getResponse: ApiResponse<ReportConfig> = await response.json();
  return getResponse;
};

export const getNominaGeneral = async (): Promise<
  ApiResponse<NominaGeneral[]>
> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}nomina/general/`,
  );
  const getResponse: ApiResponse<NominaGeneral[]> = await response.json();
  return getResponse;
};
export const getDependency = async (): Promise<ApiResponse<Dependency[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}dependencias/`,
  );
  const getResponse: ApiResponse<Dependency[]> = await response.json();
  return getResponse;
};

export const postReport = async <T, U>(values: T): Promise<ApiResponse<U>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}reports/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );
  const getResponse: ApiResponse<U> = await response.json();
  return getResponse;
};
export const getRegion = async (): Promise<ApiResponse<Region[]>> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DJANGO_API_URL}direccion/regiones/`,
  );
  const getResponse: ApiResponse<Region[]> = await response.json();
  return getResponse;
};
