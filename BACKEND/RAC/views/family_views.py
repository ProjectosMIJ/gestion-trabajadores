from rest_framework.decorators import api_view
from rest_framework import status
from django.db import transaction
from rest_framework.response import Response
from ..models.family_personal_models import Employeefamily, Parentesco
from ..models.personal_models import Employee
from ..serializers.family_serializers import FamilyCreateSerializer,FamilyListSerializer,ParentescoSerializer
from drf_spectacular.utils import extend_schema



@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Registrar un nuevo familiar",
    description="Crea un nuevo registro en la carga familiar",
    request=FamilyCreateSerializer,
)
@api_view(['POST'])
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
                "message": f"Erroral guardar el registro: {str(e)}",
                "data": []
            }, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        "status": "Error",
        "message": "Error de validación en los datos enviados.",
        "errors": serializer.errors,
        "data": []
    }, status=status.HTTP_400_BAD_REQUEST)
    
    

@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Listar carga familiar detallada",
    description="Obtiene todos los familiares de un empleado por la cedula del trabajador",
    request=FamilyListSerializer,
)
@api_view(['GET'])
def  listar_familiares(request, cedula_empleado):
    try:
        if not Employee.objects.filter(cedulaidentidad=cedula_empleado).exists():
            return Response({
                "status": "Error",
                "message": "No se encontró el empleado"
            }, status=status.HTTP_404_NOT_FOUND)

        familiares = Employeefamily.objects.filter(
             employeecedula=cedula_empleado
        )
        serializer = FamilyListSerializer(familiares, many=True)
        return Response({
            "status": "Ok",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "status": "Error",
            "message": f"Error al recuperar carga familiar: {str(e)}",
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)
    
@extend_schema(
    tags=["Familiares de Empleados"],
    summary="Registro masivo de familiares",
    description="Registra múltiples familiares enviando una lista de objetos.",
    request=FamilyCreateSerializer(many=True),
)
@api_view(['POST'])
def registrar_familiares_masivo(request):

    datos_sucios = request.data
    datos_filtrados = [ item for item in datos_sucios if isinstance(item, dict) and 'cedulaFamiliar' in item ]
    serializer = FamilyCreateSerializer(data=datos_filtrados, many=True,context={'request': request})
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
                "message": "Error al registrar - informacion invalidad o duplicada",
                "error": str(e),
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "status": "Error",
        "message": "Error de validación en la lista.",
        "errors": serializer.errors,
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
       queryset = Parentesco.objects.all()
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