from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models.functions import  Extract, Concat
from django.db.models import Count, Value, CharField

from ..models.historial_personal_models import EmployeeMovementHistory, EmployeeEgresado
from ..models.personal_models import Employee,AsigTrabajo
from ..serializers.historial_personal_serializers import MovimintoCargoSerializer,GestionStatusSerializer,GestionEgreso_PasivoSerializer,EmployeeCargoHistorySerializer,PersonalEgresadoSerializer


@api_view(['PATCH'])
def cambiar_cargo(request, cargo_id):
    try:
        puesto_actual = AsigTrabajo.objects.get(pk=cargo_id)
    except AsigTrabajo.DoesNotExist:
        return Response({
            "status": "Error",
            "message":"El código de cargo no fue encontrado"
        }, status=status.HTTP_404_NOT_FOUND)

    if puesto_actual.employee is None:
        return Response({
            "status": "Error",
            "message": "No se puede realizar un movimiento desde un puesto sin empleado asignado",
            "data": []
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = MovimintoCargoSerializer(puesto_actual, data=request.data, partial=True)
    
    if serializer.is_valid():
        try:
            puesto_nuevo = serializer.save()
            return Response({
                "status": "Ok",
                "message": "Movimiento registrado correctamente",
                "data": {
                    "nuevo_puesto": puesto_nuevo.codigo,
                    "empleado": f"{puesto_nuevo.employee.nombres} {puesto_nuevo.employee.apellidos}"
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": str(e),
                "data": []
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "status": "Error",
        "message": "Datos de movimiento inválidos o el puesto destino no está disponible",
        "data": []
    }, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['PATCH'])
def gestionar_estatus_puesto(request, cargo_id):
    try:
        puesto = AsigTrabajo.objects.get(pk=cargo_id)
    except AsigTrabajo.DoesNotExist:
        return Response({
            "status": "Error",
            "message": "El cargo no existe"
        }, status=status.HTTP_404_NOT_FOUND)

    if puesto.employee is None:
        return Response({
            "status": "Error",
            "message": "No se puede gestionar el estatus de un puesto que no tiene un empleado asignado"
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer = GestionStatusSerializer(puesto, data=request.data, partial=True)
    
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                "status": "Ok",
                "message": "El estatus ha sido actualizado exitosamente",
                "data": {
                    "codigo": puesto.codigo,
                    "nuevo_estatus": puesto.estatusid.estatus
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": f"Error al procesar el cambio de estatus: {str(e)}",
                "data": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "status": "Error",
        "message": "Datos de gestión inválidos",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['PATCH'])
def gestion_egreso_pasivo(request, cedulaidentidad):
    try:
        empleado = Employee.objects.get(cedulaidentidad=cedulaidentidad)
    except Employee.DoesNotExist:
        return Response({
            "status": "Error",
            "message": "No se encontró el empleado",
            "data":[]
        }, status=status.HTTP_404_NOT_FOUND)

    serializer = GestionEgreso_PasivoSerializer(empleado, data=request.data, partial=True)
    
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                "status": "Ok",
                "message": "Gestion realizada exitosamente",
                "data": {
                    "empleado_id": empleado.id,
                    "nombre": f"{empleado.nombres} {empleado.apellidos}",
                    "cedula": empleado.cedulaidentidad
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "Error",
                "message": f"Error al procesar el movimiento: {str(e)}",
                "data":[]
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "status": "Error",
        "message": "La validación de los datos ha fallado",
        "data":[]
    }, status=status.HTTP_400_BAD_REQUEST)
    
    
    
@api_view(['GET'])
def listar_empleado_Egresado(request,cedulaidentidad):
    try:
        empleado = EmployeeEgresado.objects.filter(
            employee=cedulaidentidad)
        if not empleado.exists():
            return Response({
                  'status': 'Error',
                  'message': str(e),
                  'data': []
            }, status = status.HTTP_404_BAD_REQUEST)
            
        serializers = PersonalEgresadoSerializer(empleado, many=True)
        
        return Response({
            'status':'OK',
            'message': 'Empleado listado correctamente',
            'data': serializers.data
        }, status = status.HTTP_200_OK)
    except Exception as e:
        return Response ({
            'status': 'Error',
            'message': str(e),
            'data': []
        }, status = status.HTTP_400_BAD_REQUEST) 
        


@api_view(['GET'])
def listar_historial_cargo(request, cedulaidentidad):
    try:
        if not Employee.objects.filter(cedulaidentidad=cedulaidentidad).exists():
            return Response({
                "status": "Error",
                "message": f"No se encontró registro del empleado.",
                "data": []
            }, status=status.HTTP_404_NOT_FOUND)

        movimientos = EmployeeMovementHistory.objects.filter(
            empleado__cedulaidentidad=cedulaidentidad
        )

        serializer = EmployeeCargoHistorySerializer(movimientos, many=True)
        
        return Response({
            "status": "Ok",
            "message": "Historial listado correctamente",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "status": "Error",
            "message": f"Error al recuperar el historial: {str(e)}",
            "data": []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
    

@api_view(['GET'])
def reporte_movimientos(request):
    try:
        contadores = EmployeeMovementHistory.objects.annotate(

            year=Extract('fecha_movimiento', 'year'),

            month=Extract('fecha_movimiento', 'month'),
        ).annotate( mes_formato=Concat('year', Value('-'), 'month', output_field=CharField() )
        ).values('mes_formato').annotate(
            count=Count('id') 
        ).order_by('mes_formato')
        data_final = []
        for item in contadores:
            data_final.append({
                'mes': item['mes_formato'], 
                'count': item['count']
            })
        
        return Response(
            { 
                'status':'OK',
                'message': 'Reporte de movimientos generado correctamente',
                'data': data_final, 
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {
                'status': 'Error',
                'message': 'Error interno del servidor', 
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )