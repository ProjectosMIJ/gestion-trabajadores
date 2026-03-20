import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from RAC.filters.filters_personal import CuentaFilter
from drf_spectacular.utils import extend_schema
from  USER.models import cuenta
from USER.serializers import *
logger = logging.getLogger(__name__)

@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Inicio de sesion",
    request=LoginSerializer, 
 
) 
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):

    try:
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.validated_data
            datos_usuario = CuentaSerializer(usuario).data
            return Response({
                'success': True,
                'data': datos_usuario
            }, status=status.HTTP_200_OK)
            
        return Response({
            'success': False, 
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)
        
    except Exception as e:
        logger.error(f"Error en login: {str(e)}")
        return Response({
            'success': False, 
            'error': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Registro de Usuario",
  request=RegisterSerializer, 
) 
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):

    try:
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            nueva_cuenta = serializer.save()
            return Response({
                'success': True, 
                'message': 'Usuario registrado exitosamente',
                'data': CuentaSerializer(nueva_cuenta).data
            }, status=status.HTTP_201_CREATED)
            
        return Response({
            'success': False, 
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Error en registro: {str(e)}")
        return Response({
            'success': False, 
            'error': 'Error interno del servidor al procesar el registro.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="editar  Usuario",
  request=UpdateCuentaSerializer, 
) 
@api_view(['PATCH', 'PUT'])
def editar_usuario(request, id):
    try:
        usuario = cuenta.objects.get(id=id)
    except cuenta.DoesNotExist:
        return Response({
            'success': False, 
            'error': 'El usuario no existe.'
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = UpdateCuentaSerializer(usuario, data=request.data, partial=True)
    
    if serializer.is_valid():
        usuario_actualizado = serializer.save()
        
    
        return Response({
            'success': True,
            'message': 'Usuario actualizado exitosamente.',
            'data': CuentaSerializer(usuario_actualizado).data
        }, status=status.HTTP_200_OK)
        
    return Response({
        'success': False, 
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)



@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="editar estatus de Usuario",

) 
@api_view(['PATCH'])
def cambiar_estado_usuario(request,id):

    try:
        usuario = cuenta.objects.get(id=id)
    except cuenta.DoesNotExist:
        return Response({
            'success': False, 
            'error': 'El usuario no existe.'
        }, status=status.HTTP_404_NOT_FOUND)

    if 'is_active' in request.data:
        nuevo_estado = request.data.get('is_active')
        if isinstance(nuevo_estado, str):
            nuevo_estado = nuevo_estado.lower() == 'true'
        usuario.is_active = bool(nuevo_estado)
    else:
        usuario.is_active = not usuario.is_active

    usuario.save()
    
    estado_str = "activado" if usuario.is_active else "suspendido"

    return Response({
        'success': True,
        'message': f'Usuario {estado_str} exitosamente.',
        'data': CuentaSerializer(usuario).data
    }, status=status.HTTP_200_OK)

@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Consulta de usuarios",
) 
@api_view(['GET'])
def usuarios_lista(request):
    try:
        queryset = cuenta.objects.select_related('cedula', 'departamento', 'rol').all()
        
        filterset = CuentaFilter(request.GET, queryset=queryset)
        
        if not filterset.is_valid():
            return Response({
                'status': "error",
                'message': "Los parámetros de filtro son inválidos.",
                'data': filterset.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        usuarios = filterset.qs[:10]
        
        serializer = CuentaSerializer(usuarios, many=True)
        
        return Response({
            'status': 'success',
            'message': 'Lista de usuarios obtenida correctamente',
            'data': serializer.data,
        
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error al listar usuarios: {str(e)}")
        return Response({
            'status': "error",
            'message': f"Error al listar: {str(e)}",
            'data': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)