from rest_framework.decorators import api_view
from rest_framework import  status, serializers
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from ..models.ubicacion_models import *
from ..serializers.ubicacion_serializers import *



@extend_schema(
    tags=["Recursos Humanos - Datos Vivienda"],
    summary="Listar regiones",
    description="Devuelve una lista de parroquias para un municipio específico.",
    responses=ParroquiaSerializer,
)
@api_view(['GET'])
def list_region(request):
    regiones = Region.objects.all()
    serializer = RegionSerializers(regiones, many=True)
    return Response({
        "status": "Ok",
        "message": "Regiones listadas",
        "data": serializer.data,},
         status=status.HTTP_200_OK)
    
    
@extend_schema(
    tags=["Recursos Humanos - Datos Vivienda"],
    summary="Listar estados",
    responses=EstadoSerializer,
)
@api_view(['GET'])
def list_estados(request):
    estados = Estado.objects.all()
    serializer = EstadoSerializer(estados, many=True)
    return Response({
        "status": "Ok",
        "message": "Estados listados",
        "data": serializer.data,},
         status=status.HTTP_200_OK)

@extend_schema(
    tags=["Recursos Humanos - Datos Vivienda"],
    summary="Listar Municipios por Estado",
    description="Devuelve una lista de municipios para un estado específico.",
    responses=MunicipioSerializer,
    )
@api_view(['GET'])
def list_municipios(request, estadoid):

    try:
        
        estado = Estado.objects.get(pk=estadoid)
    except Estado.DoesNotExist:
        return Response({
           
            "status": "Error",
            "message": "Estado no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    municipios = Municipio.objects.filter(estadoid=estadoid)
    serializer = MunicipioSerializer(municipios, many=True)
    return Response({
        "status": "Ok",
        "message": f"Municipios del estado {estado.estado}",
        "data": serializer.data
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Recursos Humanos - Datos Vivienda"],
    summary="Listar Parroquias por Municipio",
    description="Devuelve una lista de parroquias para un municipio específico.",
    responses=ParroquiaSerializer,
)
@api_view(['GET'])
def list_parroquias(request, municipioid):
    try:
        municipio = Municipio.objects.get(pk=municipioid)
    except Municipio.DoesNotExist:
        return Response({
            "status": "Error",
            "message": "Municipio no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    parroquias = Parroquia.objects.filter(municipioid=municipioid)
    serializer = ParroquiaSerializer(parroquias, many=True)
    return Response({
        "status": "Ok",
        "message": f"Parroquias del municipio {municipio.municipio}",
        "data": serializer.data
    }, status=status.HTTP_200_OK)



