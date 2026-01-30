from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from ..serializers.USER_serializers import LoginSerializer, UserSerializer,UserDetailSerializer,RegisterSerializer
from ..models.user_models import cuenta
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
import logging
from drf_spectacular.utils import extend_schema

@api_view(['GET'])
def get(request):
    try:
        # Obtener todas las cuentas con sus departamentos relacionados
        cuenta_items = cuenta.objects.select_related('departament').all()
        
        # Serializar usando el UserSerializer actualizado
        serializer = UserSerializer(cuenta_items, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    except Exception as e:
        # Mejor manejo de errores
        import logging
        logging.error(f"Error al obtener cuentas: {str(e)}")
        return Response({
            'success': False,
            'error': 'Error al obtener las cuentas',
            'detail': str(e)  # En producción, remover o controlar este detalle
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])

def login_view(request):
    try:
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {'error': 'Credenciales inválidas'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logging.error(f"Error durante el inicio de sesión: {str(e)}")
        return Response(
            {'error': 'Error en el servidor al procesar la solicitud'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    

@api_view(['GET', 'POST'])
def user_detail(request, user_id):
    """
    API endpoint para obtener o actualizar detalles de usuario
    """
    try:
        user = cuenta.objects.get(user_id=user_id)
    except cuenta.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Crear una copia de los datos para no modificar el request original
        data = request.data.copy()
        
        # Si se proporciona una contraseña, hashearla antes de guardarla
        if 'password' in data:
            data['password'] = make_password(data['password'])
        
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# registro de usuario
@extend_schema(
    tags=["Gestion de Usuarios"],
    summary="Buscar empleado por cédula",
    description="Devuelve los datos de un empleado identificado por su cédula",
    request=RegisterSerializer,
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'success': True, 'message': 'Registrado'}, status=201)
        
        return Response({'success': False, 'errors': serializer.errors}, status=400)
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)
        
   # lista los usuarios registrados
@api_view(['GET'])
def usuarios(request):

    try:
     
        usuarios = cuenta.objects.all()
        serializer = UserDetailSerializer(usuarios, many=True)
        
        return Response({
            'success': True,
            'count': len(serializer.data),
            'usuarios': serializer.data
        })
    except Exception as e:
        logging.error(f"Error al obtener lista de usuarios: {str(e)}")
        return Response({
            'success': False,
            'error': 'Error al obtener la lista de usuarios',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)