from rest_framework import serializers
from django.apps import apps

from RAC.models.personal_models import Employee
from django.db.models import Count, F, Prefetch
from RAC.services.report_service import MAPA_REPORTES
from .personal_serializers import *

from datetime import date, timedelta

from  .family_serializers import  FamilyListSerializer
from .historial_personal_serializers import PersonalEgresadoSerializer
from RAC.services.constants import ESTATUS_ACTIVO



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
        if not config or data['agrupar_por'] not in config['campos_permitidos']:
            raise serializers.ValidationError("Parámetro de agrupación no válido")
        return data

    def ejecutar(self):
        data = self.validated_data
        config = MAPA_REPORTES[data['categoria']]
        Model = apps.get_model('RAC', config['modelo'])
        campo_db = config['campos_permitidos'][data['agrupar_por']]

        filtros_finales = self._procesar_filtros(data['filtros'], config['filtros_permitidos'])
        queryset = Model.objects.filter(**filtros_finales)

        if data['categoria'] in ['familiares', 'empleados']:
            queryset = queryset.filter(assignments__estatusid__estatus=ESTATUS_ACTIVO)

        queryset = queryset.filter(**{f"{campo_db}__isnull": False}).distinct()

        if data['tipo_reporte'] == 'conteo':
            return self._ejecutar_conteo(queryset, campo_db, data['categoria'])

        return self._obtener_data_detallada(queryset, data['categoria'], filtros_finales)

    def _procesar_filtros(self, filtros_raw, permitidos):
        filtros_limpios = {}
        hoy = date.today()
        nulos = {None, "", 0, "0", "undefined", "null"}

        def procesar_edad(valor, es_max):
            anios = int(valor)
            offset = 1 if es_max else 0
            fecha = hoy.replace(year=hoy.year - anios - offset)
            if es_max: fecha += timedelta(days=1)
            return {f'fecha_nacimiento__{"gte" if es_max else "lte"}': fecha}

        for k, v in filtros_raw.items():
            if k not in permitidos or v in nulos:
                continue
                
            campo_db = permitidos[k]
            v_final = v.split('T')[0] if isinstance(v, str) and 'T' in v else v

            try:
                if "edad_" in k:
                    filtros_limpios.update(procesar_edad(v_final, k == "edad_max"))
                
                elif "apn_" in k:
                    filtros_limpios[campo_db] = float(v_final)
                
                elif campo_db.endswith('__lte') and any(w in campo_db for w in ['ingreso', 'nacimiento', 'egreso']):
                    if isinstance(v_final, str) and len(v_final) == 10:
                        filtros_limpios[campo_db] = v_final
                
                else:
                    filtros_limpios[campo_db] = v_final

            except (ValueError, TypeError, AttributeError):
                continue 
                        
        return filtros_limpios

    def _ejecutar_conteo(self, queryset, campo_db, categoria):
        target_count = 'carga_familiar' if categoria == 'familiares' else 'pk'
        return list(queryset.values(label=F(campo_db)).annotate(
            total=Count(target_count, distinct=True)
        ).order_by('-total'))

    def _obtener_data_detallada(self, queryset, categoria, filtros_finales):
        """Mapeo de funciones de lista para evitar múltiples if/elif."""
        handlers = {
            'empleados': self._preparar_lista_empleados,
            'egresados': self._preparar_lista_egresados,
            'asignaciones': self._preparar_lista_asignaciones,
            'familiares': lambda qs: self._preparar_lista_familiares(qs, filtros_finales)
        }
        return handlers[categoria](queryset)

    def _preparar_lista_asignaciones(self, queryset):
        queryset = queryset.select_related(
            'employee', 'denominacioncargoid', 'denominacioncargoespecificoid',
            'gradoid', 'tiponominaid', 'DireccionGeneral', 'DireccionLinea', 'estatusid'
        )
        return ListerCodigosSerializer(queryset, many=True).data

    def _preparar_lista_empleados(self, queryset):
        queryset = queryset.select_related('sexoid', 'estadoCivil').prefetch_related(
            'datos_vivienda_set', 'perfil_salud_set', 'perfil_fisico_set',
            'formacion_academica_set', 'antecedentes_servicio_set',
            'assignments__denominacioncargoid', 'assignments__DireccionGeneral',
            'assignments__DireccionLinea', 'assignments__estatusid'
        )
        return EmployeeDetailSerializer(queryset, many=True).data

    def _preparar_lista_egresados(self, queryset):
        queryset = queryset.select_related(
            'motivo_egreso', 'denominacioncargoid', 'denominacioncargoespecificoid',
            'gradoid', 'tiponominaid', 'DireccionGeneral', 'DireccionLinea'
        )
        return PersonalEgresadoSerializer(queryset, many=True).data

    def _preparar_lista_familiares(self, queryset, filtros_finales):
        filtros_parientes = {
            k.replace('carga_familiar__', ''): v 
            for k, v in filtros_finales.items() if k.startswith('carga_familiar__')
        }
        FamilyModel = apps.get_model('RAC', 'Employeefamily')
        AsigModel = apps.get_model('RAC', 'AsigTrabajo')

        fam_prefetch = FamilyModel.objects.select_related('parentesco', 'sexo', 'estadoCivil')\
            .filter(**filtros_parientes)\
            .prefetch_related('perfil_salud_set', 'perfil_fisico_set', 'formacion_academica_set')

        queryset = queryset.filter(carga_familiar__isnull=False).prefetch_related(
            Prefetch('assignments', queryset=AsigModel.objects.filter(estatusid__estatus=ESTATUS_ACTIVO).select_related('denominacioncargoid', 'tiponominaid', 'DireccionGeneral')),
            Prefetch('carga_familiar', queryset=fam_prefetch)
        )
        data = ReporteFamiliarAgrupadoSerializer(queryset, many=True).data
        return [emp for emp in data if emp.get('familiares')]