from rest_framework import serializers
from datetime import date
from dateutil.relativedelta import relativedelta
from RAC.models.personal_models import Employee
from RAC.services.mapa_reporte import MAPA_REPORTES


def transformar_edad_a_fecha(valor_edad):
    try:
        edad = int(valor_edad)
        return date.today() - relativedelta(years=edad)
    except (TypeError, ValueError):
        return None

class ReportePDFSerializer(serializers.Serializer):
    """
    Serializer para generar reportes PDF.
    Solo requiere la categoría y filtros opcionales.
    """
    CATEGORIAS = [
        ('empleados', 'Empleados'), 
        ('egresados', 'Egresados'), 
        ('familiares', 'Familiares'),
        ('asignaciones', 'Asignaciones/Cargos')
    ]
    
    categoria = serializers.ChoiceField(choices=CATEGORIAS)
    filtros = serializers.JSONField(required=False, default=dict)

    def validate(self, data):
        categoria = data.get('categoria')
        filtros = data.get('filtros', {})
        
        config = MAPA_REPORTES.get(categoria)
        
        if not config:
            raise serializers.ValidationError("Categoría no configurada")
            
        campos_edad = [
            'edad_min', 'edad_max', 
            'edad_empleado_min', 'edad_empleado_max',
            'edad_familiar_min', 'edad_familiar_max'
        ]

        for campo in campos_edad:
            if campo in filtros and filtros[campo] is not None:
                fecha_calculada = transformar_edad_a_fecha(filtros[campo])
                if fecha_calculada:
                    filtros[campo] = fecha_calculada

        return data
