from rest_framework.decorators import api_view
from rest_framework import  status, serializers
from rest_framework.response import Response
from ..models.ubicacion_models import Estado, Municipio, Parroquia
from ..serializers.ubicacion_serializers import EstadoSerializer, MunicipioSerializer, ParroquiaSerializer


@api_view(['GET'])
def get_estados(request):
    estados = Estado.objects.all()
    serializer = EstadoSerializer(estados, many=True)
    return Response({
        "status": "Ok",
        "message": "Estados listados",
        "data": serializer.data,},
         status=status.HTTP_200_OK)


@api_view(['GET'])
def get_municipios(request, estadoid):

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


@api_view(['GET'])
def get_parroquias(request, municipioid):

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




@api_view(['POST']) 
def estado_create_many(request):
  
    serializer = EstadoSerializer(data=request.data, many=True)
    
   
    if serializer.is_valid():

        serializer.save() 

        return Response({
            "status": "Ok",
            "message": f"Se registraron {len(request.data)} estados exitosamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        "status": "Error",
        "message": "Los datos proporcionados no son válidos para el registro masivo",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    
    

@api_view(['POST']) 
def municipio_create_many(request):
    
    serializer = MunicipioSerializer(data=request.data, many=True)
    
    if serializer.is_valid():

        serializer.save() 
        

        return Response({
            "status": "Ok",
            "message": f"Se registraron {len(request.data)} municipios exitosamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        "status": "Error",
        "message": "Los datos proporcionados para Municipio no son válidos",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST']) 
def parroquia_create_many(request):

    serializer = ParroquiaSerializer(data=request.data, many=True)
    
    if serializer.is_valid():

        serializer.save() 
        return Response({
            "status": "Ok",
            "message": f"Se registraron {len(request.data)} parroquias exitosamente",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        "status": "Error",
        "message": "Los datos proporcionados para Parroquia no son válidos",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)