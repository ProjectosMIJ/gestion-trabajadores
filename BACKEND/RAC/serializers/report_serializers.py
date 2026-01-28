from rest_framework import serializers

from RAC.models.personal_models import Employee
from RAC.services.mapa_reporte import MAPA_REPORTES
from .personal_serializers import *


from  .family_serializers import  FamilyListSerializer

from RAC.services.report_service import *


class ReporteFamiliarAgrupadoSerializer(serializers.ModelSerializer):
    cedula_empleado = serializers.CharField(source='cedulaidentidad')
    nombre_empleado = serializers.SerializerMethodField()
    sexo_empleado = SexoSerializer(source='sexoid', read_only=True)
    fecha_nacimiento_empleado = serializers.DateField(source='fecha_nacimiento')
    denominacion_cargo = serializers.SerializerMethodField()
    denominacion_cargo_especifico = serializers.SerializerMethodField()
    tipo_nomina = serializers.SerializerMethodField()
    familiares = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['cedula_empleado', 'nombre_empleado','sexo_empleado' ,'fecha_nacimiento_empleado','denominacion_cargo','denominacion_cargo_especifico', 'tipo_nomina', 'familiares']

    def _get_active_assignment(self, obj):
        assignments = obj.assignments.all()
        return assignments[0] if assignments else None

    def get_nombre_empleado(self, obj):
        return f"{obj.nombres} {obj.apellidos}"


    def get_denominacion_cargo(self, obj):
        asig = self._get_active_assignment(obj)
        if asig and getattr(asig, 'denominacioncargoid', None):
            return denominacionCargoSerializer(asig.denominacioncargoid).data
        return  None
    
    def get_denominacion_cargo_especifico(self, obj):
        asig = self._get_active_assignment(obj)
        if asig and getattr(asig, 'denominacioncargoespecificoid', None):
            return denominacionCargoEspecificoSerializer(asig.denominacioncargoespecificoid).data
        return None

    def get_tipo_nomina(self, obj):
        asig = self._get_active_assignment(obj)
        if asig and getattr(asig, 'tiponominaid', None):
            return TipoNominaSerializer(asig.tiponominaid).data
        return None

    def get_familiares(self, obj):
        return FamilyListSerializer(obj.carga_familiar.all(), many=True).data



class ReporteDinamicoSerializer(serializers.Serializer):
    CATEGORIAS = [
        ('empleados', 'Empleados'), 
        ('egresados', 'Egresados'), 
        ('familiares', 'Familiares'),
        ('asignaciones', 'Asignaciones/Cargos')
    ]
    
    categoria = serializers.ChoiceField(choices=CATEGORIAS)
    agrupar_por = serializers.CharField()
    tipo_reporte = serializers.ChoiceField(choices=[('conteo', 'Conteo'), ('lista', 'Lista')])
    filtros = serializers.JSONField(required=False, default=dict)

    def validate(self, data):

        config = MAPA_REPORTES.get(data['categoria'])
        
        if not config:
            raise serializers.ValidationError("Categoría no configurada")
            
        if data['agrupar_por'] not in config['campos_permitidos']:
            raise serializers.ValidationError("Parámetro de agrupación no válido")
            
        return data