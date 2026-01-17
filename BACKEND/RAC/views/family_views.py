from rest_framework.decorators import api_view
from rest_framework import status,serializers
from django.db import transaction
from rest_framework.response import Response
from ..models.family_personal_models import Employeefamily, Parentesco
from ..models.personal_models import Employee
from ..serializers.family_serializers import FamilyCreateSerializer,FamilyListSerializer,ParentescoSerializer


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
                "message": f"Error interno al guardar el registro: {str(e)}",
                "data": []
            }, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        "status": "Error",
        "message": "Error de validación en los datos enviados.",
        "errors": serializer.errors,
        "data": []
    }, status=status.HTTP_400_BAD_REQUEST)
    
    
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
        
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
 
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