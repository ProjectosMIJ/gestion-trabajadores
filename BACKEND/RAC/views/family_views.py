from rest_framework.decorators import api_view
from rest_framework import status
from django.db import transaction
from rest_framework.response import Response
from ..models.family_personal_models import Employeefamily, Parentesco
from ..serializers.family_serializers import FamilyCreateSerializer,FamilyListSerializer,ParentescoSerializer
from RAC.filters.filters_personal import EmployeeFamilyFilter
from drf_spectacular.utils import extend_schema



@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Gestion de familiares",
    description="Gestion de familiares de un empleado",
    request=FamilyCreateSerializer,
)
@api_view(['GET', 'POST'])
def gestion_familiar(request):

    if request.method == 'GET':
        return listar_familiares(request)
    
    elif request.method == 'POST':
        return registrar_familiar(request)

def registrar_familiar(request):
    serializer = FamilyCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                familiar = serializer.save()
                return Response({
                    "status": "Ok",
                    "message": "Familiar registrado exitosamente.",
                    "data": {
                        "id": familiar.id,
                        "cedulaFamiliar": familiar.cedulaFamiliar,
                        "nombre_completo": f"{familiar.primer_nombre} {familiar.primer_apellido}",
                        "parentesco": familiar.parentesco.descripcion_parentesco 
                    }
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": f"Error al guardar el registro: {str(e)}",
            }, status=status.HTTP_400_BAD_REQUEST)

    error_dict = serializer.errors
    first_error_field = list(error_dict.values())[0]
    clean_message = first_error_field[0] if isinstance(first_error_field, list) else first_error_field
    return Response({
        "status": "Error",
        "message": clean_message, 
    }, status=status.HTTP_400_BAD_REQUEST)


def listar_familiares(request):
    try:
        queryset = Employeefamily.objects.select_related(
            'parentesco', 'sexo', 'estadoCivil', 'employeecedula'
        ).all()

        filterset = EmployeeFamilyFilter(request.GET, queryset=queryset)
        
        if not filterset.is_valid():
            return Response({
                "status": "Error",
                "message": "Los parámetros de filtro son inválidos.",
                "errors": filterset.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        familiares = filterset.qs.distinct()[:10]
        serializer = FamilyListSerializer(familiares, many=True)
        
        return Response({
            "status": "Ok",
            "message": "Carga familiar listada correctamente",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "status": "Error",
            "message": f"Error al recuperar carga familiar: {str(e)}",
            "data": []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Listar carga familiar detallada",
    description="Obtiene todos los familiares de un empleado por la cedula del trabajador",
    request=FamilyListSerializer,
)

@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Registro masivo de familiares",
    description="Registra múltiples familiares enviando una lista de objetos.",
    request=FamilyCreateSerializer(many=True),
)
@api_view(['POST'])
def registrar_familiares_masivo(request):
    datos_sucios = request.data
    datos_filtrados = [item for item in datos_sucios if isinstance(item, dict) and 'cedulaFamiliar' in item]
    serializer = FamilyCreateSerializer(data=datos_filtrados, many=True, context={'request': request})
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                familiares_creados = serializer.save()
                
                data_response = [
                    {
                        "id": f.id,
                        "cedulaFamiliar": f.cedulaFamiliar,
                        "nombre_completo": f"{f.primer_nombre} {f.primer_apellido}",
                        "parentesco": f.parentesco.descripcion_parentesco if f.parentesco else None
                    }
                    for f in familiares_creados
                ]

                return Response({
                    "status": "Ok",
                    "message": "Familiares registrados correctamente.",
                    "data": data_response
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "status": "Error",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    clean_message = "Error de validación en los datos."
    for error in serializer.errors:
        if error:
            first_field_errors = list(error.values())[0]
            clean_message = first_field_errors[0] if isinstance(first_field_errors, list) else first_field_errors
            break  

    return Response({
        "status": "Error",
        "message": clean_message, 
        "data": []
    }, status=status.HTTP_400_BAD_REQUEST)
   
     
     
@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Listar patentescos",
    description="Devuelve una lista de todos los parentescosa disponibles.",
    responses=ParentescoSerializer,
)
@api_view(['GET'])
def listar_parentesco(request):
   try:
       valores_permitidos = ["CONYUGUE", "PADRE", "MADRE", "HIJO (A)"]
       queryset = Parentesco.objects.filter(descripcion_parentesco__in=valores_permitidos)
       serializer = ParentescoSerializer(queryset, many=True)
       return Response({
        "status": "Ok",
        "message": "Parentescos listados correctamente",
        "data": serializer.data
    }, status=status.HTTP_200_OK)
   except Exception as e:
        return Response({
            'status': 'Error',
            'message': str(e),
            "data": []
            }, status=status.HTTP_400_BAD_REQUEST)