
from rest_framework import  status,serializers
from rest_framework.response import Response
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
class ReporteGenericoView(APIView):
    def post(self, request):
        serializer = ReporteDinamicoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            resultados = serializer.ejecutar()
            return Response(resultados, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Error al procesar el reporte.", "detalle": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )