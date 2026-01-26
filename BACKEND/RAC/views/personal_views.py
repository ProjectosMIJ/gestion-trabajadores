from rest_framework.decorators import api_view
from rest_framework import viewsets, status

from rest_framework.response import Response
from django.db.models import Prefetch
from ..serializers.personal_serializers import *
from ..models.personal_models import *
from ..models.ubicacion_models import *
from ..services.constants import *

from drf_spectacular.utils import extend_schema




# registrar datos personales de empleado
@extend_schema(
    tags=["Gestion de Empleado"],
    summary="Registrar datos personales de empleadoa",
    description="Permite registrar los datos personales del empleado",
    request=EmployeeSerializer,
)
@api_view(['POST'])
def register_employee(request):
    serializer = EmployeeSerializer(data=request.data)
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
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)


#  ACTUALIZACION DE DATOS PERSONALES DEL EMPLEADO       
@extend_schema(
    tags=["Gestion de Empleado"],
    summary="Editar un empleado",
    description="Actualiza los datos de un empleado existente identificado por su id",
    request=EmployeeSerializer, 
) 
@api_view(['PATCH'])
def editar_empleado(request, id):
    try:
        empleado = Employee.objects.get(id=id)
    except Employee.DoesNotExist:
        return Response ({
            'status': "Error",
            'message': "Empleado no encontrado",
            "data": []
        }, status = status.HTTP_400_BAD_REQUEST)
    serializer = EmployeeSerializer(empleado, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Empleado actualizado correctamente",
            'data': serializer.data            
        }, status = status.HTTP_200_OK)
    return Response ({
        'status':"Error",
        'message': serializer.errors,
        "data": []
    }, status = status.HTTP_400_BAD_REQUEST)
    

# LISTA DATOS PERSONALES DEL EMPLEADO

@extend_schema(
    tags=["Gestion de Empleado"],
    summary="Buscar empleado por cédula",
    description="Devuelve los datos de un empleado identificado por su cédula",
    request=EmployeeListarDataSerializer,
)
@api_view(['GET'])
def listar_empleadosData(request,cedulaidentidad):
    try:
        empleado = Employee.objects.filter(cedulaidentidad=cedulaidentidad).get()
        serializers = EmployeeListarDataSerializer(empleado)
        return Response({
            'status':'OK',
            'message': 'Empleado listado correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)

  # CREACION DE CARGO

@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Registrar Cargos",
    description="Permite registrar los datos personales del empleado",
    request=CodigosCreateSerializer,
)

@api_view(['POST'])
def register_codigo(request):
    serializer = CodigosCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message": "Cargo registrado correctamente",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return  Response ({
                'status': "Error",
                'message': str(e),
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
        
#    ACTUALIZACION DE CARGO      
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Editar datos de un cargo",
    description="Actualiza los datos de un cargo existente identificado por su id.",
    request=CodigosUpdateSerializer,
) 
@api_view(['PATCH'])
def editar_codigo(request, id):
    try:
        codigo = AsigTrabajo.objects.get(id=id)
    except AsigTrabajo.DoesNotExist:
        return Response ({
            'status': "Error",
            'message': "Cargo no encontrado",
            "data": []
        }, status = status.HTTP_400_BAD_REQUEST)
    
    serializer = CodigosUpdateSerializer(codigo, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Cargo actualizado correctamente",
            'data': serializer.data            
        }, status = status.HTTP_200_OK)
    return Response ({
        'status':"Error",
        'message': serializer.errors,
        'data': []
    }, status = status.HTTP_400_BAD_REQUEST)
    

#  LISTA TODOS LOS CODIGOS 
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos Generales (Vacantes y Activos)",
    description="Devuelve una lista de todos los cargos registrados",
     request=CodigosListerSerializer,

)
@api_view(['GET'])
def Codigos_generales(request):
    try:
        codigos = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        )
        serializers = CodigosListerSerializer(codigos, many=True)
        return Response({
            'status':'OK',
            'message': 'Codigos listados correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)

# LISTA SOLO LOS CODIGOS VACANTES
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=CodigosListerSerializer,

)     
@api_view(['GET'])
def Codigos_Vacantes(request):
    try:
   
        

        codigos = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).filter( tiponominaid__requiere_codig=False ).select_related(
            'Tipo_personal', 'estatusid', 'tiponominaid', 'employee'
        )
        
        serializers = CodigosListerSerializer(codigos, many=True)
        return Response({
            'status':'OK',
            'message': 'Codigos listados correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
        

# lista de cargos vacantes por su direccion general
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes por direccion general",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=CodigosListerSerializer,

) 
@api_view(['GET'])
def Cargos_Vacantes_DireccionGeneral(request,direccioGenealid):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            DireccionGeneral=direccioGenealid,Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).filter( tiponominaid__requiere_codig=False ).select_related(
            'Tipo_personal', 'estatusid', 'tiponominaid', 'employee'
        )
        
        serializers = CodigosListerSerializer(codigos, many=True)
        return Response({
            'status':'OK',
            'message': 'Codigos de la direccion listados correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
        
        
        
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes por direccion de linea",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=CodigosListerSerializer,
) 
@api_view(['GET'])
def Cargos_Vacantes_direccionLinea(request,direccioLineaId):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            DireccionLinea=direccioLineaId,Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).filter( tiponominaid__requiere_codig=False ).select_related(
            'Tipo_personal', 'estatusid', 'tiponominaid', 'employee'
        )
        
        serializers = CodigosListerSerializer(codigos, many=True)
        return Response({
            'status':'OK',
            'message': 'Codigos de la direccion listados correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
        
        
@extend_schema(
    tags=["Gestion de Cargos"],
    summary="Listar Cargos unicamente Vacantes por coordinacion",
    description="Devuelve una lista de todos los cargos  vacantes registrados",
    request=CodigosListerSerializer,
) 
@api_view(['GET'])
def Cargos_Vacantes_coordinacion(request,cooridnacionoId):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            Coordinacion=cooridnacionoId,Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).filter( tiponominaid__requiere_codig=False ).select_related(
            'Tipo_personal', 'estatusid', 'tiponominaid', 'employee'
        )
        serializers = CodigosListerSerializer(codigos, many=True)
        return Response({
            'status':'OK',
            'message': 'Codigos de la coordinacion listados correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
# ASIGNACION DE CARGO  
@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Asigna un cargo al trabajador",
    description="Permite asignarle un cargo a un trabajador",
    request=AsigCargoSerializer,

) 
@api_view(['PATCH'])
def asignar_cargo(request, id):
    try:
        codigo = AsigTrabajo.objects.get(id=id)
    except AsigTrabajo.DoesNotExist:
        return Response ({
            'status': "Error",
            'message': "puesto no encontrado",
           
        }, status = status.HTTP_400_BAD_REQUEST)
    
    serializer = AsigCargoSerializer(codigo, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Cargo asignado correctamente",
            'data': serializer.data            
        }, status = status.HTTP_200_OK)
    return Response ({
        'status':"Error",
        'message': serializer.errors,
        "data": []
    }, status = status.HTTP_400_BAD_REQUEST)
    
#  REGISTRO Y ASIGNACION DE CARGO CON CODIGO AUTOGENERABLE 
@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Asignacion de cargos especiales (codigos autogenerables)",
    description="Permite registrar un cargo con codigo autogenerable y asignarlo a un trabajador",
    request=RegisterCargoEspecialSerializer,
)
@api_view(['POST'])
def Cargo_Especial(request):
    serializer = RegisterCargoEspecialSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message": "Cargo registrado y asignado correctamente",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return  Response ({
                'status': "Error",
                'message': str(e),
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)

#  LISTAR EMPLEADOS CON CARGOS 
@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Listar Empleados con sus cargos",
    description="Devuelve una lista de todos los empleados con sus cargos",
    request=EmployeeCargoSerializer,
)
@api_view(['GET'])
def listar_empleados(request):
    try:
        # definicion de filtro para las asignaciones
        filtro_asignaciones = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        )
        empleados = Employee.objects.filter(assignments__Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO).prefetch_related(
            Prefetch('assignments', queryset=filtro_asignaciones)
        ).distinct()
        serializers = EmployeeCargoSerializer(empleados, many=True)
        return Response({
            'status': 'OK',
            'message': 'Empleados listados correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
        
    

#  LISTAR EMPLEADOS CON CARGOS  POR CEDULA
@extend_schema(
    tags=["Asignacion de Cargos"],
    summary="Buscar empleado por cédula",
    description="Devuelve los datos de un empleado identificado por su cédula.",
     request=EmployeeCargoSerializer,
) 
@api_view(['GET'])
def listar_empleadosCedula(request,cedulaidentidad):
    try:
        # definicion de filtro para las asignaciones
        filtro_asignaciones = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO
        )
        
        empleado = Employee.objects.filter(cedulaidentidad=cedulaidentidad,assignments__Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO).prefetch_related(
            Prefetch('assignments', queryset=filtro_asignaciones)
        ).distinct().first()
       
        if not empleado:
            return Response({
                'status': 'Error',
                'message': "No se encontró un empleado con cargo asignado con la cédula",
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)
            
            
        serializer = EmployeeCargoSerializer(empleado)
        
        if serializer.data is None:
             return Response({
                'status': 'Error',
                'message': 'El empleado no posee asignaciones activas.',
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'status': 'OK',
            'message': 'Empleado encontrado con éxito',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)

class EmployeeViewSet(viewsets.ModelViewSet):
    lookup_field = 'cedulaidentidad'
    serializer_class =EmployeeCargoSerializer

    def get_queryset(self):
        return Employee.objects.all().prefetch_related('assignments').distinct()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response({
                'message': 'Empleados listados correctamente',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'Error',
                'message': str(e),
                'data': []
            }, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            
            return Response({
                'mensaje': 'Datos encontrados correctamente',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception:
            return Response({
                'mensaje': 'Peticion invalida, error: 508(AttributeError)',
            }, status=status.HTTP_400_BAD_REQUEST)    
    




@extend_schema(
    tags=["Recursos Humanos - Organismo Adscrito"],
    summary="Registrar organismos adscritos",
    description="Registra los organismos adscritos",
     request=EmployeeCargoSerializer,
) 
  
@api_view(['POST'])
def register_organismoAdscrito(request):
    serializer = OrganismoAdscritoSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message":"Organismo Adscrito registrado correctamente",
                "data": serializer.data
            }, status = status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': "Error",
                'message': str(e),
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
   

@extend_schema(
    tags=["Recursos Humanos - Organismo Adscrito"],
    summary="Listar Organismos Adscritos",
    description="Devuelve una lista de todos los organismos adscritos disponibles.",
    responses=OrganismoAdscritoSerializer
    
)
@api_view(['GET'])
def Organismo_adscrito(request):
    try:
       queryset = OrganismoAdscrito.objects.all()
       serializer = OrganismoAdscritoSerializer(queryset, many=True)
       return Response({
        "status": "Ok",
        "message": "Organismos Adscritos listados correctamente", 
        "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
    
# direccion general creacion   
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Creacion de Direccion General",
    description="Permite registrar una direccion general",
    request=DireccionGeneralSerializer,
)   
@api_view(['POST'])
def register_DireccionGeneral(request):
    serializer = DireccionGeneralSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message":"Direccion General registrada correctamente",
                "data": serializer.data
            }, status = status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': "Error",
                'message': str(e),
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
        
        
#   ACTUALIZACION DE LA DIRECCION GENERAL 
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Actualiza datos de la direccion general",
    description="Permite actualizar los datos de la direccion general",
    request=DireccionGeneralSerializer,
) 
@api_view(['PATCH'])
def Actualizar_DireccionGeneral(request, id):
    try:
        Direccion_General = DireccionGeneral.objects.get(id=id)
    except DireccionGeneral.DoesNotExist:
        return Response ({
            'status': "Error",
            'message': "Direccion General no encontrado"
        }, status = status.HTTP_400_BAD_REQUEST)
    
    serializer = DireccionGeneralSerializer(Direccion_General, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Direccion General actualizada correctamente",
            'data': serializer.data            
        }, status = status.HTTP_200_OK)
    return Response ({
        'status':"Error",
        'message': serializer.errors,
        "data": []
    }, status = status.HTTP_400_BAD_REQUEST)

#  CREACION DE DIRECCION DE LINEA 
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Creacion de Direccion de Linea",
    description="Permite registrar una direccion de linea",
    request=DireccionLineaSerializer,
) 
@api_view(['POST'])
def register_DireccionLinea(request):
    serializer = DireccionLineaSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message":"Direccion de Linea registrada correctamente",
                "data": serializer.data
            }, status = status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': "Error",
                'message': str(e),
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)
#  ACTUALIZACION DE DIRECCION DE LINEA
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Actualiza datos de la direccion de linea",
    description="Permite actualizar los datos de la direccion de linea",
    request=DireccionGeneralSerializer,
) 
@api_view(['PATCH'])
def Actualizar_DireccionLinea(request, id):
    try:
        Direccion_Linea = DireccionLinea.objects.get(id=id)
    except DireccionLinea.DoesNotExist:
        return Response ({
            'status': "Error",
            'message': "Direccion de Linea no encontrado"
        }, status = status.HTTP_400_BAD_REQUEST)
    
    serializer = DireccionLineaSerializer(Direccion_Linea, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Direccion de Linea actualizada correctamente",
            'data': serializer.data            
        }, status = status.HTTP_200_OK)
    return Response ({
        'status':"Error",
        'message': serializer.errors,
        "data": []
    }, status = status.HTTP_400_BAD_REQUEST)

#  CREACION DE COORDINACION

@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Creacion de Coordinacion",
    description="Permite registrar una Coordinacion",
    request=CoordinacionSerializer,
) 
@api_view(['POST'])
def register_Coordinacion(request):
    serializer = CoordinacionSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'status': "Created",
                "message":"Coordinacion registrada correctamente",
                "data": serializer.data
            }, status = status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': "Error",
                'message': str(e),
                'data': []
            }, status = status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST)

#  ACTUALIZACION DE LA COORDINACION
@extend_schema(
    tags=["Recursos Humanos - Dependencia"],
    summary="Actualiza datos de la coordinacion",
    description="Permite actualizar los datos de la coordinacion",
    request=CoordinacionSerializer,
) 
@api_view(['PATCH'])
def Actualizar_Coordinacion(request, id):
    try:
        cooridacion = Coordinaciones.objects.get(id=id)
    except Coordinaciones.DoesNotExist:
        return Response ({
            'status': "Error",
            'message': "oordinacion no encontrado"
        }, status = status.HTTP_400_BAD_REQUEST)
    
    serializer = CoordinacionSerializer(cooridacion, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': "OK",
            'message': "Coordinacion actualizada correctamente",
            'data': serializer.data            
        }, status = status.HTTP_200_OK)
    return Response ({
        'status':"Error",
        'message': serializer.errors,
        "data": []
    }, status = status.HTTP_400_BAD_REQUEST)


# ..................
# LISTAR DATOS 
# ..................

@extend_schema(
    tags=["Recursos Humanos - Datos Personales"],
    summary="Listar sexos",
    description="Devuelve una lista de todos los sexos disponibles.",
    responses=SexoSerializer
)
@api_view(['GET'])
def listar_sexo(request):
   try:
       queryset = Sexo.objects.all()
       serializer = SexoSerializer(queryset, many=True)
       return Response({
        "status": "Ok",
        "message": "Sexos listados correctamente",
        "data": serializer.data
    }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(
    tags=["Recursos Humanos - Datos Personales"],
    summary="Listar Estado civil",
    description="Devuelve una lista de todos los Estado civil disponibles.",
    responses=EstadoCivilSerializer
)
@api_view(['GET'])
def listar_EstadoCivil(request):
   try:
       queryset = estado_civil.objects.all()
       serializer = EstadoCivilSerializer(queryset, many=True)
       return Response({
        "status": "Ok",
        "message": "Estados civiles listados correctamente",
        "data": serializer.data
    }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        

@extend_schema(
    tags=["Recursos Humanos - Datos Academicos"],
    summary="Listar nivel Academico",
    description="Devuelve una lista de todos los niveles Academicos disponibles.",
    responses=NivelAcademicoSerializer
)
@api_view(['GET'])
def listar_nivelAcademico(request):
   try:
        queryset = NivelAcademico.objects.all()
        serializer = NivelAcademicoSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Niveles Academicos listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
      
@extend_schema(
    tags=["Recursos Humanos - Datos Academicos"],
    summary="Listar carreras",
    description="Devuelve una lista de todas las carreras disponibles.",
    responses=CarrerasSerializer
)
@api_view(['GET'])
def Carreras(request):
   try:
        queryset = carreras.objects.all()
        serializer = CarrerasSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "carreras listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(
    tags=["Recursos Humanos - Datos Academicos"],
    summary="Listar Menciones por Carrera",
    description="Devuelve una lista de las menciones asociadas a una carrera específica ",
    responses=MencionSerializer
)
@api_view(['GET'])
def Menciones_carreras(request, carrera_id):
    try:
       
        menciones = Menciones.objects.filter(carrera_id=carrera_id)

        if not menciones.exists():
            return Response({
                'status': 'Error',
                'message': "No se encontraron menciones asociadas a esta carrera",
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = MencionSerializer(menciones, many=True)

        return Response({
            'status': 'OK',
            'message': 'Menciones encontradas con éxito',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)  
@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar Grupo sanguineo",
    description="Devuelve una lista de todos los Grupos sanguineos disponibles.",
    responses=GrupoSanguineoSerializer
)
@api_view(['GET'])
def listar_GrupoSanguineo(request):
   try:
        queryset = GrupoSanguineo.objects.all()
        serializer = GrupoSanguineoSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Grupos sanguineos listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        



@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar cateogrias de las Patologias Cronicas",
    description="Devuelve una lista de todos los categorias de las Patologias Cronicas disponibles.",
    responses=categoriasPatologiasSerializer
)
@api_view(['GET'])
def categorias_Patologias(request):
   try:
        queryset = categorias_patologias.objects.all()
        serializer = categoriasPatologiasSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Categorias de las Patologias Cronicas listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        


@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar patologias ",
    description="Devuelve una lista de todas las patologias disponibles",
    responses=PatologiasSerializer
)
@api_view(['GET'])
def Patologias(request):
   try:
        queryset = patologias_Cronicas.objects.all()
        serializer = PatologiasSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "patologias listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar categorias de las Discapacidades",
    description="Devuelve una lista de todas lascategorias de las Discapacidades disponibles.",
    responses=categoriasDiscapacidadesSerializer
)

@api_view(['GET'])
def Categorias_Discapacidades(request):
   try:
        queryset = categorias_discapacidad.objects.all()
        serializer = categoriasDiscapacidadesSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "categorias de Discapacidades listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        




@extend_schema(
    tags=["Recursos Humanos - Datos de Salud"],
    summary="Listar discapacidades",
    description="Devuelve una lista de todas las discapacidades disponibles",
    responses=DiscapacidadSerializer
)

@api_view(['GET'])
def discapacidades(request):
   try:
        queryset = Discapacidades.objects.all()
        serializer = DiscapacidadSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "discapacidades listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(
    tags=["Recursos Humanos - Datos Vivienda"],
    summary="Listar condicion de vivienda",
    description="Devuelve una lista de todas las condiciones de vivienda disponibles.",
    responses=CondicionViviendaSerializer
)
@api_view(['GET'])
def CondicionVivienda(request):
   try:
        queryset = condicion_vivienda.objects.all()
        serializer = CondicionViviendaSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "condiciones de vivienda  listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    tags=["Recursos Humanos - Datos Fisicos"],
    summary="Listar Tallas de Camisas",
    description="Devuelve una lista de todas las Tallas de Camisas disponibles.",
    responses=TallaCamisaSerializer
)
@api_view(['GET'])
def listar_TallasCamisas(request):
   try:
        queryset = Talla_Camisas.objects.all()
        serializer = TallaCamisaSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Tallas de Camisas listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        

@extend_schema(
    tags=["Recursos Humanos - Datos Fisicos"],
    summary="Listar Tallas de Pantalones",
    description="Devuelve una lista de todas las Tallas de Pantalones disponibles.",
    responses=Talla_PantalonSerializer
)
@api_view(['GET'])
def listar_TallasPantalones(request):
   try:
        queryset = Talla_Pantalones.objects.all()
        serializer =Talla_PantalonSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Tallas de Pantalones listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
  
@extend_schema(
    tags=["Recursos Humanos - Datos Fisicos"],
    summary="Listar Tallas de Zapatos",
    description="Devuelve una lista de todas las Tallas de Zapatos disponibles.",
    responses=Talla_ZapatosSerializer
)
@api_view(['GET'])
def listar_TallasZapatos(request):
   try:
        queryset = Talla_Zapatos.objects.all()
        serializer =Talla_ZapatosSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Tallas de Zapatos listadas correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
             "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
  

@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar denominaciones de cargo",
    description="Devuelve una lista de todas las denominaciones de cargo disponibles.",
    responses=denominacionCargoSerializer
)
@api_view(['GET'])
def listar_denominacion_cargo(request):
    try:
       queryset = Denominacioncargo.objects.all()
       serializer = denominacionCargoSerializer(queryset, many=True)
       return Response({
        "status": "Ok",
        "message": "Denominaciones de Cargos listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
    
    

@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar denominaciones de cargo específico",
    description="Devuelve una lista de todas las denominaciones de cargo específico disponibles.",
    responses=denominacionCargoEspecificoSerializer
)
@api_view(['GET'])
def listar_denominacion_cargo_especifico(request):
    try:
        queryset = Denominacioncargoespecifico.objects.all()
        serializer =denominacionCargoEspecificoSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Denominaciones de Cargos Específicos listados correctamente",
        "data": serializer.data
         }, status=status.HTTP_200_OK) 
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
       
    
    
    
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar grados",
    description="Devuelve una lista de todos los grados disponibles.",
    responses=gradoSerializer
)
@api_view(['GET'])
def listar_grado(request):
    try:
       queryset = Grado.objects.all()
       serializer = gradoSerializer(queryset, many=True)
       return Response({
        "status": "Ok",
        "message": "Grados listados correctamente",
        "data": serializer.data
       }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar tipos de nómina generales",
    description="Devuelve una lista de todos los tipos de nómina disponibles.",
    responses=TipoNominaGeneralSerializer
)
@api_view(['GET'])
def listar_nominaGeneral(request):
    try:
      queryset = Tiponomina.objects.all()
      serializer = TipoNominaGeneralSerializer(queryset, many=True)
      return Response({
        "status": "Ok",
        "message": "Tipos de Nómina listados correctamente",
        "data": serializer.data
      }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar tipos de nómina sin las nominas especiales(comision de servicio y hp)",
    description="Devuelve una lista de todos los tipos de nómina disponibles.",
    responses=TipoNominaSerializer
)
@api_view(['GET'])
def listar_tipo_nomina(request):
    try:
        
      exclusiones = [
            "JUBILADO EMPLEADO",
            "PENSIONADO INCAPACIDAD EMPLEADO",
            "PENSIONADO SOBREVIVIENTE",
            "JUBILADO EXTINTA DISIP",
            "PENSIONADO INCAP VIUDA EXTINTA DISIP",
            "JUBILADO POLICIA METROPOLITANO (ADMI)",
            "JUBILADO OBRERO",
            "PENSIONADOS POR INCAPACIDAD POLICIA",
            "PENSIONADOS MENORES EXTINTA DISIP",
            "JUBILADOS EMPLEADOS",
            "JUBILADOS EXTINTA DISIP DECRETO",
            "JUBILADOS EXTINTA DISIP",
            "JUBILADOS OBREROS"
        ]
      queryset = Tiponomina.objects.filter(requiere_codig=False).exclude(
            nomina__in=exclusiones
        )
      serializer = TipoNominaSerializer(queryset, many=True)
      return Response({
        "status": "Ok",
        "message": "Tipos de Nómina listados correctamente",
        "data": serializer.data
      }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar solo nóminas de Personal Pasivo",
    description="Devuelve una lista exclusiva de Jubilados y Pensionados.",
    responses=TipoNominaSerializer
)
@api_view(['GET'])
def listar_tipo_nomina_pasivos(request):
    try:
     
        nominas_pasivos = [
            "JUBILADO EMPLEADO",
            "PENSIONADO INCAPACIDAD EMPLEADO",
            "PENSIONADO SOBREVIVIENTE",
            "JUBILADO EXTINTA DISIP",
            "PENSIONADO INCAP VIUDA EXTINTA DISIP",
            "JUBILADO POLICIA METROPOLITANO (ADMI)",
            "JUBILADO OBRERO",
            "PENSIONADOS POR INCAPACIDAD POLICIA",
            "PENSIONADOS MENORES EXTINTA DISIP",
            "JUBILADOS EMPLEADOS",
            "JUBILADOS EXTINTA DISIP DECRETO",
            "JUBILADOS EXTINTA DISIP",
            "JUBILADOS OBREROS"
        ]

        queryset = Tiponomina.objects.filter(nomina__in=nominas_pasivos)

        serializer = TipoNominaSerializer(queryset, many=True)
        
        return Response({
            "status": "Ok",
            "message": "Nóminas de personal pasivo listadas correctamente",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar solo las nominas especiales(comision de servicio y hp)",
    description="Devuelve una lista de todos los tipos de nómina disponibles.",
    responses=TipoNominaSerializer
)
@api_view(['GET'])
def listar_tipo_nominaEspeciales(request):
    try:
      queryset = Tiponomina.objects.filter(requiere_codig=True)
      serializer = TipoNominaSerializer(queryset, many=True)
      return Response({
        "status": "Ok",
        "message": "Tipos de Nómina listados correctamente",
        "data": serializer.data
      }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar Direcciones Generales",
    description="Devuelve una lista de todas las Direcciones Generales disponibles.",
    responses=DireccionGeneralSerializer
)
@api_view(['GET'])
def listar_DireecionGeneral(request):
    try:
      queryset = DireccionGeneral.objects.all()
      serializer = DireccionGeneralSerializer(queryset, many=True)
      return Response({
        "status": "Ok",
        "message": "Direcciones Generales listados correctamente",
        "data": serializer.data
      }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        
@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar Direcciones de Linea",
    description="Devuelve una lista de todos los tipos de Direcciones de Linea disponibles.",
    responses=DireccionLineaSerializer
)
@api_view(['GET'])
def direccion_lineal(request, direccionGeneral):

    try:
       DireccionGeneal = DireccionGeneral.objects.get(pk=direccionGeneral)
    except DireccionGeneral.DoesNotExist:
        return Response({
            
            "status": "Error",
            "message": "Direccion Geneal no encontrada",
            "data": []
        }, status=status.HTTP_404_NOT_FOUND)

    direccionLinea = DireccionLinea.objects.filter(direccionGeneral=direccionGeneral)
    serializer = DireccionLineaSerializer(direccionLinea, many=True)
    return Response({
        "status": "Ok",
        "message": f"Direccion Lineal listada correctamente",
        "data": serializer.data
    }, status=status.HTTP_200_OK)
    
    

@extend_schema(
    tags=["Recursos Humanos - Datos para Cargo"],
    summary="Listar Coordinaciones",
    description="Devuelve una lista de todos los tipos de Coordinaciones disponibles.",
    responses=CoordinacionSerializer
)
@api_view(['GET'])
def listar_Coordinaciones(request, direccionLinea):

    try:
       Direccion_Linea= DireccionLinea.objects.get(pk=direccionLinea)
    except DireccionLinea.DoesNotExist:
        return Response({
            "status": "Error",
            "message": "Direccion de linea no encontrada",
            "data": []
        }, status=status.HTTP_404_NOT_FOUND)
    cooridnaciones = Coordinaciones.objects.filter(direccionLinea=direccionLinea)
    serializer = CoordinacionSerializer(cooridnaciones, many=True)
    return Response({
        "status": "Ok",
        "message": f"Coordinaciones listadas correctamente",
        "data": serializer.data
    }, status=status.HTTP_200_OK)
    
    
@extend_schema(
    tags=["Recursos Humanos - Gestion de estatus"],
    summary="Listar Estatus GENERAL",
    description="Devuelve una lista de todos los tipos de estatus  disponibles.",
    responses=EstatusSerializer
)
@api_view(['GET'])
def listar_estatus(request):
   try:
        queryset = Estatus.objects.all()
        serializer = EstatusSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Estatus listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
        

@extend_schema(
    tags=["Recursos Humanos - Gestion de estatus"],
    summary="Listar Estatus para personal pasivo y egresado",
    description="Devuelve una lista de todos los tipos de estatus  disponibles.",
    responses=EstatusSerializer
)
@api_view(['GET'])
def listar_estatus_Egresos(request):
   try:
        
       
        queryset = Estatus.objects.filter( estatus__in=ESTATUS_PERMITIDOS_EGRESOS).order_by('estatus')
        serializer = EstatusSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Estatus listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    tags=["Recursos Humanos - Gestion de estatus"],
    summary="Listar Estatus para la gestion de cambio de estatus (SUSPENDIDO, BLOQUEADO, VACANTE)",
    description="Devuelve una lista de todos los tipos de estatus  disponibles.",
    responses=EstatusSerializer
)
@api_view(['GET'])
def listar_estatus_Gestion(request):
   try:
        
       
        queryset = Estatus.objects.filter( estatus__in=ESTATUS_PERMITIDOS).order_by('estatus')
        serializer = EstatusSerializer(queryset, many=True)
        return Response({
        "status": "Ok",
        "message": "Estatus listados correctamente",
        "data": serializer.data
        }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)




