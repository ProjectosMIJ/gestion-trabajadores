from rest_framework import serializers

from RAC.models.personal_models import Employee
from RAC.services.mapa_reporte import MAPA_REPORTES




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
        config = MAPA_REPORTES.get(data['categoria'])
        
        if not config:
            raise serializers.ValidationError("Categoría no configurada")
            
        return data
