
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from ..serializers.personal_serializers import *
from django.db.models import Prefetch
from ..models.personal_models import *
from ..models.ubicacion_models import *
from ..services.constants import *
from ..services.report_service import *
from drf_spectacular.utils import extend_schema




@extend_schema(
    tags=["Gestion de Empleado"],
    summary="Registrar datos personales de empleadoa",
    description="Permite registrar los datos personales del empleado",
    request=EmployeeCreateUpdateSerializer,
)
@api_view(['POST'])
def create_employee(request):
    serializer = EmployeeCreateUpdateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message": "Datos de empleado registrados correctamente",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return  Response ({
                'status': "Error",
                'message': str(e),
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
        }, status = status.HTTP_400_BAD_REQUEST)

#  ACTUALIZACION DE DATOS PERSONALES DEL EMPLEADO       
@extend_schema(
    tags=["Gestion de Empleado"],
    summary="Editar un empleado",
    description="Actualiza los datos de un empleado existente identificado por su id",
    request=EmployeeCreateUpdateSerializer, 
) 
@api_view(['PATCH'])
def update_employee(request, id):
    empleado = get_object_or_404(Employee, id=id)

    serializer = EmployeeCreateUpdateSerializer(empleado, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Empleado actualizado correctamente",
            'data': serializer.data            
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': "Error",
            'message': "No se pudo actualizar el registro.",
            'debug': str(e),
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# LISTADO DE EMPLEADOS

@extend_schema(
    tags=["Gestion de Empleado"],
    summary="Buscar empleado por cédula",
    description="Devuelve los datos de un empleado identificado por su cédula",
    request=EmployeeListSerializer,
)
@api_view(['GET'])
def retrieve_employee(request, cedulaidentidad):
    try:
        empleado = Employee.objects.select_related(
            'sexoid', 'estadoCivil'
        ).prefetch_related(
           'datos_vivienda_set__estado_id',
            'datos_vivienda_set__municipio_id',
            'datos_vivienda_set__parroquia',
            'datos_vivienda_set__condicion_vivienda_id',
            
            'perfil_salud_set__grupoSanguineo',
            'perfil_salud_set__discapacidad',
            'perfil_salud_set__patologiaCronica',
            
            'formacion_academica_set__nivel_Academico_id',
            'formacion_academica_set__carrera_id',
            'formacion_academica_set__mencion_id',
            
            'perfil_fisico_set',
            'antecedentes_servicio_set',
            'assignments__denominacioncargoid',
            'assignments__estatusid'
        ).get(cedulaidentidad=cedulaidentidad)

        serializer = EmployeeListSerializer(empleado)
        
        return Response({
            'status': 'success',
            'message': 'Empleado obtenido correctamente',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Employee.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'No se encontró un empleado con la cédula',
        
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'message': 'Ocurrió un error inesperado en el servidor',
            
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Registrar Cargos",
    description="Permite registrar los datos personales del empleado",
    request=CodigosCreateUpdateSerializer,
)
@api_view(['POST'])
def create_position(request):

    serializer = CodigosCreateUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        return Response({
            'status': "success",
            "message": "Cargo registrado correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar el registro del cargo.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Editar datos de un cargo",
    description="Actualiza los datos de un cargo existente identificado por su id.",
    request=CodigosCreateUpdateSerializer,
) 
@api_view(['PATCH'])
def update_position(request, id):
    codigo = get_object_or_404(AsigTrabajo, id=id)

    serializer = CodigosCreateUpdateSerializer(codigo, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        return Response({
            'status': "success",
            'message': "Cargo actualizado correctamente",
            'data': serializer.data            
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo actualizar el cargo debido a un error interno.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Asigna un cargo al trabajador",
    description="Permite asignarle un cargo a un trabajador",
    request=EmployeeAssignmentSerializer,
)
@api_view(['PATCH'])
def assign_employee(request, id):       
    puesto = get_object_or_404(AsigTrabajo, id=id)
    

    serializer = EmployeeAssignmentSerializer(puesto, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        return Response({
            'status': "success",
            'message': "Cargo asignado correctamente",
            'data': serializer.data            
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar la asignación del empleado.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Asignacion de cargos especiales (codigos autogenerables)",
    description="Permite registrar un cargo con codigo autogenerable y asignarlo a un trabajador",
    request=SpecialPositionAutoCreateSerializer,
)
@api_view(['POST'])
def assign_employee_special(request):
    serializer = SpecialPositionAutoCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        
        return Response({
            'status': "success",
            "message": "Empleado asignado y código especial generado correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar la asignación especial.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@extend_schema(
    tags=["Recursos Humanos - Organismo Adscrito"],
    summary="Registrar organismos adscritos",
    description="Registra los organismos adscritos",
     request=OrganismoAdscritoSerializer,
)
@api_view(['POST'])
def create_subsidiary_organism(request):
    serializer = OrganismoAdscritoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        
        return Response({
            'status': "success",
            "message": "Organismo Adscrito registrado correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar el registro del organismo.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
# direccion general creacion   
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Creacion de Direccion General",
    description="Permite registrar una direccion general",
    request=DireccionGeneralSerializer,
)
@api_view(['POST'])
def create_general_directorate(request):
    serializer = DireccionGeneralSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        
        return Response({
            'status': "success",
            "message": "Dirección General registrada correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar el registro de la Dirección General.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
 #  CREACION DE DIRECCION DE LINEA 
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Creacion de Direccion de Linea",
    description="Permite registrar una direccion de linea",
    request=DireccionLineaSerializer,
)     
@api_view(['POST'])
def create_line_directorate(request):
    serializer = DireccionLineaSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        return Response({
            'status': "success",
            "message": "Dirección de Línea registrada correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar el registro de la Dirección de Línea",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)    
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Creacion de Coordinacion",
    description="Permite registrar una Coordinacion",
    request=CoordinacionSerializer,
) 
@api_view(['POST'])
def create_coordination(request):
    serializer = CoordinacionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    try:
        serializer.save()
        
        return Response({
            'status': "success",
            "message": "Coordinación registrada correctamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo completar el registro de la Coordinación",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
  

# LISTAR Employee CON CARGOS 

@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Listar Empleados con sus cargos",
    description="Devuelve una lista de todos los empleados con sus cargos",
    request=EmployeeDetailSerializer,
)
@api_view(['GET'])
def list_employees_active(request):

    try:
        filtro_asignaciones = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        )

        empleados = Employee.objects.filter(
            assignments__Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        ).prefetch_related(
            Prefetch('assignments', queryset=filtro_asignaciones)
        ).distinct()

        serializer = EmployeeDetailSerializer(empleados, many=True)

        return Response({
            'status': "success",
            'message': "Empleados activos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de empleados.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Buscar empleado por cédula",
    description="Devuelve los datos de un empleado identificado por su cédula.",
     request=EmployeeDetailSerializer,
) 
@api_view(['GET'])
def get_employee_by_id(request, cedula):

    try:
        filtro_asignaciones = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        )

        empleado = Employee.objects.filter(
            cedulaidentidad=cedula,
            assignments__Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        ).prefetch_related(
            Prefetch('assignments', queryset=filtro_asignaciones)
        ).distinct().first()

        if not empleado:
            return Response({
                'status': "error",
                'message': "No se encontró el empleado o no posee cargos activos.",
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = EmployeeDetailSerializer(empleado)
        
        return Response({
            'status': "success",
            'message': "Empleado localizado con éxito",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "Ocurrió un error al procesar la búsqueda del empleado.",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        

# LISTA DE CARGOS 

#  LISTA TODOS LOS CODIGOS 
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos Generales (Vacantes y Activos)",
    description="Devuelve una lista de todos los cargos registrados",
     request=ListerCodigosSerializer,
)
@api_view(['GET'])
def list_general_work_codes(request):

    try:

        queryset = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        )
        
        serializer = ListerCodigosSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Códigos de trabajo listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de códigos generales.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
 
# LISTA SOLO LOS CODIGOS VACANTES
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=ListerCodigosSerializer,

)
@api_view(['GET'])
def list_vacant_work_codes(request):

    try:
        queryset = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, 
            estatusid__estatus__iexact=ESTATUS_VACANTE,
            tiponominaid__requiere_codig=False
        ).select_related(
            'Tipo_personal', 
            'estatusid', 
            'tiponominaid', 
            'employee'
        )
        
        serializer = ListerCodigosSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Se encontraron códigos de vacantes correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de códigos de vacantes.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# lista de cargos vacantes por su direccion general
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes por direccion general",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=ListerCodigosSerializer,

)
@api_view(['GET'])
def list_vacant_codes_by_general_directorate(request, general_id):

    get_object_or_404(DireccionGeneral, pk=general_id)

    try:
        queryset = AsigTrabajo.objects.filter(
            DireccionGeneral=general_id,
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, 
            estatusid__estatus__iexact=ESTATUS_VACANTE,
            tiponominaid__requiere_codig=False
        ).select_related(
            'Tipo_personal', 
            'estatusid', 
            'tiponominaid', 
            'employee'
        )
        
        serializer = ListerCodigosSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Vacantes de la dirección listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudieron recuperar las vacantes de la dirección.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes por direccion de linea",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=ListerCodigosSerializer,
) 
@api_view(['GET'])
def list_vacant_codes_by_line_directorate(request, line_id):

    get_object_or_404(DireccionLinea, pk=line_id)

    try:
        queryset = AsigTrabajo.objects.filter(
            DireccionLinea=line_id,
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, 
            estatusid__estatus__iexact=ESTATUS_VACANTE,
            tiponominaid__requiere_codig=False
        ).select_related(
            'Tipo_personal', 
            'estatusid', 
            'tiponominaid', 
            'employee'
        )
        
        serializer = ListerCodigosSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Vacantes de la dirección de línea obtenidas",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudieron recuperar las vacantes de esta dirección de línea.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  

@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes por coordinacion",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=ListerCodigosSerializer,
) 
@api_view(['GET'])
def list_vacant_codes_by_coordination(request, coordination_id):

    get_object_or_404(Coordinaciones, pk=coordination_id)

    try:
        queryset = AsigTrabajo.objects.filter(
            Coordinacion=coordination_id,
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, 
            estatusid__estatus__iexact=ESTATUS_VACANTE,
            tiponominaid__requiere_codig=False
        ).select_related(
            'Tipo_personal', 
            'estatusid', 
            'tiponominaid', 
            'employee'
        )
        
        serializer = ListerCodigosSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': f"Vacantes de la coordinación obtenidas",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudieron recuperar las vacantes de esta coordinación.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
             
# DATOS PERFIL

@extend_schema(
    tags=["Recursos Humanos - Datos Personales"],
    summary="Listar sexos",
    description="Devuelve una lista de todos los sexos disponibles.",
    responses=SexoSerializer
)
@api_view(['GET'])
def list_genders(request):
    try:
        queryset = Sexo.objects.all()
        serializer = SexoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Sexos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudieron recuperar los datos de sexo.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@extend_schema(
    tags=["Recursos Humanos - Datos Personales"],
    summary="Listar Estado civil",
    description="Devuelve una lista de todos los Estado civil disponibles.",
    responses=EstadoCivilSerializer
)
@api_view(['GET'])
def list_marital_statuses(request):
    try:
        queryset = estado_civil.objects.all()
        serializer = EstadoCivilSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Estados civiles listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la información de estados civiles.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# DATOS ACADEMICOS 

@extend_schema(
    tags=["Recursos Humanos - Datos Academicos"],
    summary="Listar nivel Academico",
    description="Devuelve una lista de todos los niveles Academicos disponibles.",
    responses=NivelAcademicoSerializer
)
@api_view(['GET'])
def list_academic_levels(request):
    try:
        queryset = NivelAcademico.objects.all()
        serializer = NivelAcademicoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Niveles académicos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de niveles académicos.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Recursos Humanos - Datos Academicos"],
    summary="Listar carreras",
    description="Devuelve una lista de todas las carreras disponibles.",
    responses=CarrerasSerializer
)
@api_view(['GET'])
def list_careers(request):
    try:
        queryset = carreras.objects.all()
        serializer = CarrerasSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Carreras listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de carreras.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Recursos Humanos - Datos Academicos"],
    summary="Listar Menciones por Carrera",
    description="Devuelve una lista de las menciones asociadas a una carrera específica ",
    responses=MencionSerializer
)
@api_view(['GET'])
def list_career_specializations(request, carrera_id):
    try:
        menciones = Menciones.objects.filter(carrera_id=carrera_id)

        if not menciones.exists():
            return Response({
                'status': 'error',
                'message': "No se encontraron menciones para la carrera",
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = MencionSerializer(menciones, many=True)

        return Response({
            'status': 'success',
            'message': 'Menciones obtenidas correctamente',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': 'Ocurrió un error inesperado al recuperar las menciones.',
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


# UBICACION DEL VIVIENDA

@extend_schema(
    tags=["Recursos Humanos - Datos Vivienda"],
    summary="Listar condicion de vivienda",
    description="Devuelve una lista de todas las condiciones de vivienda disponibles.",
    responses=CondicionViviendaSerializer
)
@api_view(['GET'])
def list_housing_conditions(request):
    try:
        queryset = condicion_vivienda.objects.all()
        serializer = CondicionViviendaSerializer(queryset, many=True)
        return Response({
            'status': "success",
            'message': "Condiciones de vivienda listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de condiciones de vivienda.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DATOS DE VESTIMENTA
@extend_schema(
    tags=["Recursos Humanos - Datos Fisicos"],
    summary="Listar Tallas de Camisas",
    description="Devuelve una lista de todas las Tallas de Camisas disponibles.",
    responses=TallaCamisaSerializer
)
@api_view(['GET'])
def list_shirt_sizes(request):
    try:
        queryset = Talla_Camisas.objects.all()
        serializer = TallaCamisaSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Tallas de camisas listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de tallas de camisas.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@extend_schema(
    tags=["Recursos Humanos - Datos Fisicos"],
    summary="Listar Tallas de Pantalones",
    description="Devuelve una lista de todas las Tallas de Pantalones disponibles.",
    responses=TallaPantalonSerializer
)
@api_view(['GET'])
def list_pant_sizes(request):
    try:

        queryset = Talla_Pantalones.objects.all()
        serializer = TallaPantalonSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Tallas de pantalones listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de tallas de pantalones.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["Recursos Humanos - Datos Fisicos"],
    summary="Listar Tallas de Zapatos",
    description="Devuelve una lista de todas las Tallas de Zapatos disponibles.",
    responses=TallaZapatosSerializer
)
@api_view(['GET'])
def list_shoe_sizes(request):
    try:

        queryset = Talla_Zapatos.objects.all()
        serializer = TallaZapatosSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Tallas de calzado listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de tallas de calzado.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DATOS DE SALUD  

@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar Grupo sanguineo",
    description="Devuelve una lista de todos los Grupos sanguineos disponibles.",
    responses=GrupoSanguineoSerializer
)
@api_view(['GET'])
def list_blood_types(request):
    try:
        queryset = GrupoSanguineo.objects.all()
        serializer = GrupoSanguineoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Grupos sanguíneos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la información de grupos sanguíneos.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
 
@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar cateogrias de las Patologias Cronicas",
    description="Devuelve una lista de todos los categorias de las Patologias Cronicas disponibles.",
    responses=categoriasPatologiasSerializer
)
@api_view(['GET'])
def list_pathology_categories(request):
    try:
        queryset = categorias_patologias.objects.all()
        serializer = categoriasPatologiasSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Categorías de patologías listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de categorías.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
     
           
@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar patologias ",
    description="Devuelve una lista de todas las patologias disponibles",
    responses=PatologiasSerializer
)
@api_view(['GET'])
def list_chronic_pathologies(request):
    try:
        queryset = patologias_Cronicas.objects.all()
        serializer = PatologiasSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Patologías listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la información de patologías.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar categorias de las Discapacidades",
    description="Devuelve una lista de todas lascategorias de las Discapacidades disponibles.",
    responses=categoriasDiscapacidadesSerializer
)
@api_view(['GET'])
def list_disability_categories(request):
    try:
        queryset = categorias_discapacidad.objects.all()
        serializer = categoriasDiscapacidadesSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Categorías de discapacidades listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de categorías de discapacidad.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar discapacidades",
    description="Devuelve una lista de todas las discapacidades disponibles",
    responses=DiscapacidadSerializer
)      
@api_view(['GET'])
def list_disabilities(request):
    try:
        queryset = Discapacidades.objects.all()
        serializer = DiscapacidadSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Discapacidades listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de discapacidades.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
        
# DEPENDENCIAS
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar Direcciones Generales",
    description="Devuelve una lista de todas las Direcciones Generales disponibles.",
    responses=DireccionGeneralSerializer
)
@api_view(['GET'])
def list_general_directorates(request):
    try:
        queryset = DireccionGeneral.objects.all()
        serializer = DireccionGeneralSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Direcciones Generales listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de Direcciones Generales.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar Direcciones de Linea",
    description="Devuelve una lista de todos los tipos de Direcciones de Linea disponibles.",
    responses=DireccionLineaSerializer
)
@api_view(['GET'])
def list_line_directorates_by_general(request, general_id):
 
    get_object_or_404(DireccionGeneral, pk=general_id)
    try:
        direcciones_linea = DireccionLinea.objects.filter(direccionGeneral=general_id)
        serializer = DireccionLineaSerializer(direcciones_linea, many=True)
        
        return Response({
            'status': "success",
            'message': "Direcciones de Línea obtenidas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "Ocurrió un error al recuperar las Direcciones de Línea.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar Coordinaciones",
    description="Devuelve una lista de todos los tipos de Coordinaciones disponibles.",
    responses=CoordinacionSerializer
)
@api_view(['GET'])
def list_coordinations_by_line(request, line_id):
    get_object_or_404(DireccionLinea, pk=line_id)

    try:
        queryset = Coordinaciones.objects.filter(direccionLinea=line_id)
        serializer = CoordinacionSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Coordinaciones obtenidas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "Ocurrió un error al recuperar las coordinaciones.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
 
@extend_schema(
    tags=["Recursos Humanos - Organismo Adscrito"],
    summary="Listar Organismos Adscritos",
    description="Devuelve una lista de todos los organismos adscritos disponibles",
    responses=OrganismoAdscritoSerializer
)       
@api_view(['GET'])
def list_subsidiary_organisms(request):
    try:
        queryset = OrganismoAdscrito.objects.all()
        serializer = OrganismoAdscritoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Organismos adscritos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de organismos adscritos.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)  
      
# CARGOS 
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar denominaciones de cargo",
    description="Devuelve una lista de todas las denominaciones de cargo disponibles.",
    responses=denominacionCargoSerializer
)
@api_view(['GET'])
def list_position_denominations(request):
    try:
        queryset = Denominacioncargo.objects.all()
        serializer = denominacionCargoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Denominaciones de cargos listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de denominaciones de cargos.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar denominaciones de cargo específico",
    description="Devuelve una lista de todas las denominaciones de cargo específico disponibles.",
    responses=denominacionCargoEspecificoSerializer
)
@api_view(['GET'])
def list_specific_position_denominations(request):
    try:
        queryset = Denominacioncargoespecifico.objects.all()
        serializer = denominacionCargoEspecificoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Denominaciones de cargos específicos listadas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de cargos específicos.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar grados",
    description="Devuelve una lista de todos los grados disponibles.",
    responses=gradoSerializer
)
def list_job_grades(request):
    try:
        queryset = Grado.objects.all()
        serializer = gradoSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Grados listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de grados.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# NOMINAS
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar tipos de nómina generales",
    description="Devuelve una lista de todos los tipos de nómina disponibles.",
    responses=TipoNominaGeneralSerializer
)
@api_view(['GET'])
def list_payroll_types(request):
    try:
        queryset = Tiponomina.objects.all()
        serializer = TipoNominaGeneralSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Tipos de nómina listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:

        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de tipos de nómina.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar tipos de nómina sin las nominas especiales(comision de servicio y hp)",
    description="Devuelve una lista de todos los tipos de nómina disponibles.",
    responses=TipoNominaSerializer
)
@api_view(['GET'])
def list_active_payroll_types(request):

    try:
        queryset = Tiponomina.objects.filter(es_activo=True, requiere_codig=False )
        serializer = TipoNominaSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Tipos de nómina activos obtenidos correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return Response({
            'status': "error",
            'message': "Ocurrió un error al consultar los tipos de nómina.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar solo las nominas especiales(comision de servicio y hp)",
    description="Devuelve una lista de todos los tipos de nómina disponibles.",
    responses=TipoNominaSerializer
)
@api_view(['GET'])
def list_special_payroll_types(request):
    try:

        queryset = Tiponomina.objects.filter(requiere_codig=True)
        serializer = TipoNominaSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Tipos de nómina especiales listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        # 2. Error de servidor (500)
        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de nóminas especiales.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      
 
       
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar solo nóminas de Personal Pasivo",
    description="Devuelve una lista exclusiva de Jubilados y Pensionados.",
    responses=TipoNominaSerializer
)
@api_view(['GET'])
def list_retired_payroll_types(request):
    try:
        queryset = Tiponomina.objects.filter(es_activo=False)
        
        serializer = TipoNominaSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Nóminas de personal pasivo obtenidas correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
        return Response({
            'status': "error",
            'message': "Error al recuperar las nóminas de personal pasivo.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# ESTATUS 

@extend_schema(
    tags=["Recursos Humanos - Gestion de estatus"],
    summary="Listar Estatus para personal pasivo y egresado",
    description="Devuelve una lista de todos los tipos de estatus  disponibles.",
    responses=EstatusSerializer
)
@api_view(['GET'])
def list_exit_statuses(request):
    try:

        queryset = Estatus.objects.filter(
            estatus__in=ESTATUS_PERMITIDOS_EGRESOS
        ).order_by('estatus')
        
        serializer = EstatusSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Estatus de egreso obtenidos correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:
    
        return Response({
            'status': "error",
            'message': "Error al recuperar los estatus de egreso.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@extend_schema(
    tags=["Recursos Humanos - Gestion de estatus"],
    summary="Listar Estatus para la gestion de cambio de estatus (SUSPENDIDO, BLOQUEADO, VACANTE)",
    description="Devuelve una lista de todos los tipos de estatus  disponibles.",
    responses=EstatusSerializer
)
@api_view(['GET'])
def list_management_statuses(request):
    try:
        queryset = Estatus.objects.filter(
            estatus__in=ESTATUS_PERMITIDOS
        ).order_by('estatus')
        
        serializer = EstatusSerializer(queryset, many=True)
        
        return Response({
            'status': "success",
            'message': "Estatus de gestión obtenidos correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception:

        return Response({
            'status': "error",
            'message': "No se pudo recuperar la lista de estatus de gestión.",
            'data': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        