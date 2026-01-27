from rest_framework import serializers
from django.apps import apps

from RAC.models.personal_models import Employee
from django.db.models import Count, F, Prefetch
from RAC.services.report_service import MAPA_REPORTES
from .personal_serializers import EmployeeDetailSerializer, denominacionCargoSerializer, denominacionCargoEspecificoSerializer, TipoNominaSerializer

from datetime import date, timedelta

from  .family_serializers import  FamilyListSerializer
from .historial_personal_serializers import PersonalEgresadoSerializer
from RAC.services.constants import ESTATUS_ACTIVO



class ReporteFamiliarAgrupadoSerializer(serializers.ModelSerializer):
    cedula_empleado = serializers.CharField(source='cedulaidentidad')
    nombre_empleado = serializers.SerializerMethodField()
    denominacion_cargo = serializers.SerializerMethodField()
    denominacion_cargo_especifico = serializers.SerializerMethodField()
    tipo_nomina = serializers.SerializerMethodField()
    familiares = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['cedula_empleado', 'nombre_empleado', 'denominacion_cargo','denominacion_cargo_especifico', 'tipo_nomina', 'familiares']

    def _get_active_assignment(self, obj):
        assignments = obj.assignments.all()
        return assignments[0] if assignments else None

    def get_nombre_empleado(self, obj):
        return f"{obj.nombres} {obj.apellidos}"

    def get_denominacion_cargo(self, obj):
        asig = self._get_active_assignment(obj)
        if asig and getattr(asig, 'denominacioncargoid', None):
            return denominacionCargoSerializer(asig.denominacioncargoid).data
        return "SIN CARGO"
    
    def get_denominacion_cargo_especifico(self, obj):
        asig = self._get_active_assignment(obj)
        if asig and getattr(asig, 'denominacioncargoespecificoid', None):
            return denominacionCargoEspecificoSerializer(asig.denominacioncargoespecificoid).data
        return "SIN CARGO ESPECIFICO"

    def get_tipo_nomina(self, obj):
        asig = self._get_active_assignment(obj)
        if asig and getattr(asig, 'tiponominaid', None):
            return TipoNominaSerializer(asig.tiponominaid).data
        return "SIN NÓMINA"

    def get_familiares(self, obj):
        return FamilyListSerializer(obj.carga_familiar.all(), many=True).data

class ReporteDinamicoSerializer(serializers.Serializer):
    CATEGORIAS = [('empleados', 'Empleados'), ('egresados', 'Egresados'), ('familiares', 'Familiares')]
    
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

        queryset = Model.objects.all()

        filtros_finales = self._procesar_filtros(data['filtros'], config['filtros_permitidos'])
        queryset = queryset.filter(**filtros_finales)

        if data['categoria'] in ['familiares', 'empleados']:
            queryset = queryset.filter(assignments__estatusid__estatus=ESTATUS_ACTIVO)

        queryset = queryset.filter(**{f"{campo_db}__isnull": False}).distinct()

        if data['tipo_reporte'] == 'conteo':
            return self._ejecutar_conteo(queryset, campo_db, data['categoria'])

        return self._obtener_data_detallada(queryset, data['categoria'], filtros_finales)

    def _ejecutar_conteo(self, queryset, campo_db, categoria):
        target_count = 'carga_familiar' if categoria == 'familiares' else 'pk'
        return list(queryset.values(label=F(campo_db)).annotate(
            total=Count(target_count, distinct=True)
        ).order_by('-total'))

    def _procesar_filtros(self, filtros_raw, permitidos):
        filtros_limpios = {}
        hoy = date.today()

        for k, v in filtros_raw.items():
            if k in permitidos and v not in [None, ""]:
                campo_db = permitidos[k]
                
                if k == "edad_max":
                    try:
                        fecha_limite = hoy.replace(year=hoy.year - int(v) - 1) + timedelta(days=1)
                        filtros_limpios['fecha_nacimiento__gte'] = fecha_limite
                    except ValueError: continue
                
                elif k == "edad_min":
                    try:
                        fecha_limite = hoy.replace(year=hoy.year - int(v))
                        filtros_limpios['fecha_nacimiento__lte'] = fecha_limite
                    except ValueError: continue

                elif any(x in k for x in ["apn_min", "apn_max"]):
                    try:
                        filtros_limpios[campo_db] = float(v)
                    except ValueError: continue
                
                elif campo_db.endswith('__lte'):
                    if any(word in campo_db for word in ['ingreso', 'nacimiento']):
                        filtros_limpios[campo_db] = v
                    else:
                        if isinstance(v, str) and len(v) == 10:
                            filtros_limpios[campo_db] = f"{v} 23:59:59"
                        else:
                            filtros_limpios[campo_db] = v
                
                else:
                    filtros_limpios[campo_db] = v
                    
        return filtros_limpios

    def _obtener_data_detallada(self, queryset, categoria, filtros_finales):
        if categoria == 'empleados':
            return self._preparar_lista_empleados(queryset)
            
        if categoria == 'egresados':
            queryset = queryset.select_related(
                'motivo_egreso', 'denominacioncargoid', 'denominacioncargoespecificoid',
                'gradoid', 'tiponominaid', 'DireccionGeneral', 'DireccionLinea'
            )
            return PersonalEgresadoSerializer(queryset, many=True).data
            
        if categoria == 'familiares':
            return self._preparar_lista_familiares(queryset, filtros_finales)

        raise serializers.ValidationError("Categoria no implementada")

    def _preparar_lista_empleados(self, queryset):
        queryset = queryset.select_related('sexoid', 'estadoCivil').prefetch_related(
            'datos_vivienda_set',     
            'perfil_salud_set',
            'perfil_fisico_set',
            'formacion_academica_set',
            'antecedentes_servicio_set',
            'assignments__denominacioncargoid',
            'assignments__DireccionGeneral',
            'assignments__DireccionLinea',
            'assignments__estatusid'
        )
        return EmployeeDetailSerializer(queryset, many=True).data

    def _preparar_lista_familiares(self, queryset, filtros_finales):
        filtros_parientes = {}
        for clave, valor in filtros_finales.items():
            if clave.startswith('carga_familiar__'):
                nueva_clave = clave.replace('carga_familiar__', '')
                filtros_parientes[nueva_clave] = valor

        FamilyModel = apps.get_model('RAC', 'Employeefamily')
        AsigModel = apps.get_model('RAC', 'AsigTrabajo')

        familiares_qs = FamilyModel.objects.select_related(
            'parentesco', 'sexo', 'estadoCivil'
        ).filter(**filtros_parientes).prefetch_related(
            'perfil_salud_set', 'perfil_fisico_set', 'formacion_academica_set'
        )

        queryset = queryset.filter(carga_familiar__isnull=False).prefetch_related(
            Prefetch(
                'assignments', 
                queryset=AsigModel.objects.filter(
                    estatusid__estatus=ESTATUS_ACTIVO
                ).select_related('denominacioncargoid', 'tiponominaid', 'DireccionGeneral')
            ),
            Prefetch('carga_familiar', queryset=familiares_qs)
        )

        data_serializada = ReporteFamiliarAgrupadoSerializer(queryset, many=True).data
        return [emp for emp in data_serializada if emp.get('familiares')]