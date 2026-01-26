
from rest_framework import  status,serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from ..serializers.report_serializers import *
from ..services.report_service import *


@extend_schema(
    tags=["Reportes"],
    summary="configuraciones de Reportes Dinamicos",
    description="Devuelve una lista de todos los tipos de estatus  disponibles.",

)
class ReporteConfigView(APIView):
    def get(self, request):

        config = obtener_configuracion_reportes()
    
        return Response(config, status=status.HTTP_200_OK)

@extend_schema(
        tags=["Reportes"],
        summary="Generar Reporte Dinámico",
        description="Genera estadísticas (conteo) o listados detallados de empleados, familiares o egresados.",
        request=ReporteDinamicoSerializer,
        responses={200: serializers.ListField()}
)
@api_view(['POST'])
def generate_dynamic_report(request):
    serializer = ReporteDinamicoSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            resultados = serializer.ejecutar()
            return Response({
                "status": "Ok",
                "message": "Reporte generado correctamente",
                "data": resultados
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': "Error",
                'message': str(e),
            }, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "Error",
            'message': serializer.errors,
        }, status=status.HTTP_400_BAD_REQUEST)