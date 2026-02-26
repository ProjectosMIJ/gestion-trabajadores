
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from RAC.serializers.personal_pasivo_serializers import *
from django.db.models import Prefetch
from ..models.personal_models import *

from RAC.filters.filters_personal import EmployeeFilter, AsigTrabajoFilter
from ..services.constants import *

from drf_spectacular.utils import extend_schema

from rest_framework.response import Response
from rest_framework import status




@extend_schema(
    tags=["Gestion de Personal Pasivo"],
    summary="Listar Cargos Generales del personal pasivo",
    description="Devuelve una lista de todos los cargos registrados",
     request=ListerCodigosPassiveSerializer,
)
@api_view(['GET'])
def list_work_codes_passive(request):
    try:
        queryset = AsigTrabajo.objects.filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_PASIVO
        )

        filterset = AsigTrabajoFilter(request.GET, queryset=queryset)
        
        if not filterset.is_valid():
            return Response({
                'status': "error",
                'message': "Los parámetros de filtro son inválidos.",
                'data': []
            }, status=status.HTTP_400_BAD_REQUEST)

        codigos = filterset.qs.distinct()[:10]
        
        serializer = ListerCodigosPassiveSerializer(codigos, many=True)
        
        return Response({
            'status': "success",
            'message': "Códigos de trabajo listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': f"No se pudo recuperar la lista de códigos: {str(e)}",
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    tags=["Gestion de Personal Pasivo"],
    summary="Listar personal Pasivo con sus cargos",
    description="Devuelve una lista el personal Pasivo con sus cargos",
    request=EmployeePasiveDetailSerializer,
)

@api_view(['GET'])
def list_employees_pasive(request):
    try:
        filtro_asignaciones = AsigTrabajo.objects.select_related('Tipo_personal').filter(
            Tipo_personal__tipo_personal__iexact=PERSONAL_PASIVO
        )
        
        queryset = Employee.objects.filter(
            assignments__Tipo_personal__tipo_personal__iexact=PERSONAL_PASIVO
        ).prefetch_related(
            Prefetch('assignments', queryset=filtro_asignaciones)
        ).distinct()

        filterset = EmployeeFilter(request.GET, queryset=queryset)
        
        if not filterset.is_valid():
            return Response({
                'status': "error",
                'message': "Los parámetros de búsqueda son inválidos.",
                'data': []
            }, status=status.HTTP_400_BAD_REQUEST)

   
        empleados = filterset.qs[:10]

        serializer = EmployeePasiveDetailSerializer(empleados, many=True)

        return Response({
            'status': "success",
            'message': "Trabajadores pasivos listados correctamente",
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': "error",
            'message': f"Error al recuperar la lista de empleados: {str(e)}",
            'data': []
        }, status=status.HTTP_400_BAD_REQUEST)
      