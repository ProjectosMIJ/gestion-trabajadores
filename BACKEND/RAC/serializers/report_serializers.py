from rest_framework import serializers
from django.apps import apps
from .personal_serializers import CodigosListerSerializer

from ..services.report_service import *
from django.db.models import F, Count, Prefetch
from datetime import date, timedelta
from RAC.models.personal_models import Employee
from  .family_serializers import  FamilyListSerializer
from .historial_personal_serializers import PersonalEgresadoSerializer




class ReporteFamiliarAgrupadoSerializer(serializers.ModelSerializer):
    cedula_empleado = serializers.CharField(source='cedulaidentidad')
    nombre_empleado = serializers.SerializerMethodField()
    cargo = serializers.SerializerMethodField()
    tipo_nomina = serializers.SerializerMethodField()
    familiares = serializers.SerializerMethodField()

    class Meta:
        model = apps.get_model('RAC', 'Employee')
        fields = ['cedula_empleado', 'nombre_empleado', 'cargo', 'tipo_nomina', 'familiares']

    def get_nombre_empleado(self, obj):
        return f"{obj.nombres} {obj.apellidos}"

    def get_cargo(self, obj):
        asig = obj.assignments.first()
        return asig.denominacioncargoid.cargo if asig and asig.denominacioncargoid else "SIN CARGO"

    def get_tipo_nomina(self, obj):
        asig = obj.assignments.first()
        return asig.tiponominaid.nomina if asig and asig.tiponominaid else "SIN NÓMINA"

    def get_familiares(self, obj):
        from .family_serializers import FamilyListSerializer
        return FamilyListSerializer(obj.carga_familiar.all(), many=True).data
    
    
class EmployeeReporteSerializer(serializers.ModelSerializer):
    asignaciones = CodigosListerSerializer(source='assignments', many=True, read_only=True)
    sexo = serializers.ReadOnlyField(source='sexoid.sexo')
    estado_civil = serializers.ReadOnlyField(source='estadoCivil.estadoCivil')

    class Meta:
        model = apps.get_model('RAC', 'Employee')
        fields = [
            'id',
            'cedulaidentidad',
            'nombres', 
            'apellidos',
            'sexo',
            'estado_civil', 
            'asignaciones', 
            'fecha_actualizacion']
        
class ReporteDinamicoSerializer(serializers.Serializer):
    CATEGORIAS = [('empleados', 'Empleados'), ('egresados', 'Egresados'), ('familiares', 'Familiares')]
    
    categoria = serializers.ChoiceField(choices=CATEGORIAS)
    agrupar_por = serializers.CharField()
    tipo_reporte = serializers.ChoiceField(choices=[('conteo', 'Conteo'), ('lista', 'Lista')])
    filtros = serializers.JSONField(required=False, default=dict)

    def validate(self, data):
        
        config = MAPA_REPORTES.get(data['categoria'])
        
        if not config or data['agrupar_por'] not in config['campos_permitidos']:
            raise serializers.ValidationError({"agrupar_por": "Parámetro de agrupación no válido."})
        return data

    def ejecutar(self):

        data = self.validated_data
        config = MAPA_REPORTES[data['categoria']]
        
        model_target = 'Employee' if data['categoria'] == 'familiares' else config['modelo']
        Model = apps.get_model('RAC', model_target)
        campo_db = config['campos_permitidos'][data['agrupar_por']]

        filtros_finales = self._procesar_filtros(data['filtros'], config['filtros_permitidos'])
        queryset = Model.objects.filter(**filtros_finales).distinct()

        if data['tipo_reporte'] == 'conteo':
            return list(queryset.values(label=F(campo_db)).annotate(
                total=Count('pk', distinct=True)
            ).order_by('-total'))

        return self._obtener_data_detallada(queryset, data['categoria'], filtros_finales)

    def _procesar_filtros(self, filtros_raw, permitidos):
        filtros_limpios = {}
        for k, v in filtros_raw.items():
            if k in permitidos and v not in [None, ""]:
                if k == "edad_max":
                    filtros_limpios[permitidos[k]] = date.today() - timedelta(days=int(v) * 365.25)
                else:
                    filtros_limpios[permitidos[k]] = v
        return filtros_limpios

    def _obtener_data_detallada(self, queryset, categoria, filtros_finales):
        if categoria == 'empleados':
            queryset = queryset.filter(assignments__isnull=False).prefetch_related(
                'sexoid', 'estadoCivil', 'assignments__denominacioncargoid',
                'assignments__tiponominaid', 'assignments__DireccionGeneral', 'assignments__estatusid'
            )
            return EmployeeReporteSerializer(queryset, many=True).data
            
        elif categoria == 'egresados':
            queryset = queryset.select_related(
                'motivo_egreso', 'denominacioncargoid', 'denominacioncargoespecificoid',
                'gradoid', 'tiponominaid', 'DireccionGeneral', 'DireccionLinea'
            )
            return PersonalEgresadoSerializer(queryset, many=True).data
            
        elif categoria == 'familiares':
            
            fecha_corte = filtros_finales.get('carga_familiar__fechanacimiento__gte')

            familiares_qs = apps.get_model('RAC', 'Employeefamily').objects.select_related(
                'parentesco', 'sexo', 'estadoCivil'
            ).prefetch_related(
                'perfil_salud_set', 'perfil_fisico_set', 'formacion_academica_set'
            )

            if fecha_corte:
                familiares_qs = familiares_qs.filter(fechanacimiento__gte=fecha_corte)

            queryset = queryset.filter(carga_familiar__isnull=False).prefetch_related(
                'assignments__denominacioncargoid',
                'assignments__tiponominaid',
                Prefetch(
                    'carga_familiar',
                    queryset=familiares_qs
                )
            )

            data_serializada = ReporteFamiliarAgrupadoSerializer(queryset, many=True).data
            return [emp for emp in data_serializada if emp['familiares']]

        raise serializers.ValidationError("Categoría no soportada")