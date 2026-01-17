from rest_framework.decorators import api_view
from rest_framework import viewsets, status,serializers
from rest_framework.response import Response
from django.db.models import Prefetch
from ..serializers.personal_serializers import *
from ..models.personal_models import *
from ..models.ubicacion_models import *
from ..services.constants import *


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
    


@api_view(['GET'])
def listar_empleadosData(request,cedulaidentidad):
    try:
   
        
        empleado = Employee.objects.filter(
            cedulaidentidad=cedulaidentidad).get()
        
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



@api_view(['GET'])
def Codigos_Vacantes(request):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).exclude(tiponominaid__nomina__in=NOMINAS_EXCLUIDAS).select_related(
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
        


@api_view(['GET'])
def Cargos_Vacantes_DireccionGeneral(request,direccioGenealid):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            DireccionGeneral=direccioGenealid,Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).exclude(tiponominaid__nomina__in=NOMINAS_EXCLUIDAS).select_related(
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
        
    
@api_view(['GET'])
def Cargos_Vacantes_direccionLinea(request,direccioLineaId):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            DireccionLinea=direccioLineaId,Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).exclude(tiponominaid__nomina__in=NOMINAS_EXCLUIDAS).select_related(
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
        
        

@api_view(['GET'])
def Cargos_Vacantes_coordinacion(request,cooridnacionoId):
    try:
   
        
        codigos = AsigTrabajo.objects.filter(
            Coordinacion=cooridnacionoId,Tipo_personal__tipo_personal__iexact=PERSONAL_ACTIVO, estatusid__estatus__iexact=ESTATUS_VACANTE
        ).exclude(tiponominaid__nomina__in=NOMINAS_EXCLUIDAS).select_related(
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
        




@api_view(['GET'])
def Patologias(request, categoria_id):
    try:
        patologias = patologias_Cronicas.objects.filter(categoria_id=categoria_id)

        if not patologias.exists():
            return Response({
                'status': 'Error',
                'message': "No se encontraron patologías asociadas a esta categoría",
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PatologiasSerializer(patologias, many=True)

        return Response({
            'status': 'Ok',
            'message': 'Patologías Crónicas listadas correctamente',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def listar_Categorias_Discapacidades(request):
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
        



@api_view(['GET'])
def listar_Discapacidades(request, categoria_id):
    try:
        discapacidades = Discapacidades.objects.filter(categoria_id=categoria_id)

        if not discapacidades.exists():
            return Response({
                'status': 'Error',
                'message': "No se encontraron discapacidades asociadas a esta categoría",
                'data': []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = DiscapacidadSerializer(discapacidades, many=True)

        return Response({
            'status': 'OK',
            'message': 'Discapacidades encontradas con éxito',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)

        

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
        

@api_view(['GET'])
def Menciones_carreras(request, carrera_id):
    try:
        # Asumiendo que en tu modelo Menciones el campo se llama 'carrera_id' o 'carrera'
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
       
    
    

@api_view(['GET'])
def listar_Organismo_adscrito(request):
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


# reportes
