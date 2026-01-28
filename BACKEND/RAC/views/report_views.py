
from rest_framework import  status,serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema,OpenApiExample

from ..serializers.report_serializers import *
from ..services.report_service import *
from ..services.mapa_reporte import *

@extend_schema(
    tags=["Reportes - Configuraciones"],
    summary="configuraciones de Reportes para empleados",
)
class EmployeeReportConfigView(APIView):
    def get(self, request):
        try:
            data = get_config_by_category('empleados')
            if not data:
                return Response({
                    "status": "Error",
                    "message": "No se pudo cargar la configuración de empleados"
                }, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                "status": "Ok",
                "message": "Configuracion de empleados cargada correctamente",
                "data":data
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": "Error al obtener la configuración de empleados",
            }, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    tags=["Reportes - Configuraciones"],
    summary="configuraciones de Reportes para codigos de asignaciones",
)
class assignmentsReportConfigView(APIView):
    def get(self, request):
        try:
            data = get_config_by_category('asignaciones')
            if not data:
                return Response({
                    "status": "Error",
                    "message": "No se pudo cargar la configuracion de asignaciones"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "status": "Ok",
                "message": "Configuracion de asignaciones cargada correctamente",
                "data":data
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": "Error al obtener la configuracion de asignaciones",
            }, status=status.HTTP_400_BAD_REQUEST)
@extend_schema(
    tags=["Reportes - Configuraciones"],
    summary="configuraciones de Reportes para familiares",
)
class FamilyReportConfigView(APIView):
    def get(self, request):
        try:
            data = get_config_by_category('familiares')
            if not data:
                return Response({
                    "status": "Error",
                    "message": "No se pudo cargar la configuracion de familiares"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({ 
                "status": "Ok",
                "message": "Configuracion de familiares cargada correctamente",
                "data":data
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": "Error al obtener la configuración de familiares",
            }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Reportes - Configuraciones"],
    summary="configuraciones de Reportes para egresados",
)
class GraduateReportConfigView(APIView):
    def get(self, request):
        try:
            data = get_config_by_category('egresados')
            if not data:
                return Response({
                    "status": "Error",
                    "message": "No se pudo cargar la configuracion de egresados"
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "status": "Ok",
                "message": "Configuracion de egresados cargada correctamente",
                "data":data
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": "Error al obtener la configuracion de egresados",
            }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Reportes - Configuraciones"],
    summary="Clasificacion de los tipos de reportes",
)
class ReportTypesConfigView(APIView):
    def get(self, request):
        try:
            tipos = get_report_types_config()
            return Response({
                "status": "Ok",  
                "message": "Tipos de reporte cargados correctamente",
                "data":tipos
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": 'Error al obtener los tipos de reporte',
             
            }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Reportes - Configuraciones"],
    summary="Clasificacion de los tipos de reportes",
)
class AllReportsConfigView(APIView):

    def get(self, request):
        try:
            categorias = get_available_report_categories()
            return Response({
                "status": "Ok",
                "message": "Configuraciones cargadas correctamente",
                "data": categorias
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "Error",
                "message": "No se pudo cargar ninguna configuracion",
            }, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
        tags=["Reportes"],
        summary="Generar Reporte Dinámico",
        description="Genera estadísticas o listados detallados de empleados, familiares o egresados.",
        request=ReporteDinamicoSerializer,
        responses={200: serializers.ListField()},
        examples=[
        OpenApiExample(
            'Ejemplo de Conteo de Familiares',
            summary='Reporte de conteo agrupado por nómina',
            description='Filtra familiares por sexo y los cuenta según el tipo de nómina del titular.',
            value={
                "categoria": "familiares",
                "agrupar_por": "tipo_nomina",
                "tipo_reporte": "conteo",
                "filtros": {
                    "sexo_id": 1
                }
            },
            request_only=True, 
        ),
    ]
)
@api_view(['POST'])
def generate_dynamic_report(request):
    serializer = ReporteDinamicoSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            resultados = ReporteService.ejecutar(
                mapa_config=MAPA_REPORTES,
                **serializer.validated_data
            )
            
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