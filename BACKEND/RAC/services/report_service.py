from django.apps import apps
from django.db.models import F, Count, Prefetch,Q
from django.utils.dateparse import parse_date, parse_datetime
from datetime import timedelta
from django.utils import timezone

from RAC.serializers.personal_serializers import (
    EmployeeDetailSerializer, ListerCodigosSerializer
)
from RAC.serializers.historial_personal_serializers import PersonalEgresadoSerializer
from RAC.serializers.report_serializers import ReporteFamiliarAgrupadoSerializer
from RAC.services.constants import PERSONAL_ACTIVO


class ReporteService:
    @classmethod
    def ejecutar(cls, categoria, agrupar_por, tipo_reporte, filtros, mapa_config):
        config = mapa_config[categoria]
        Model = apps.get_model('RAC', config['modelo'])
        campo_db = config['campos_permitidos'][agrupar_por]

        filtros_finales = cls._procesar_filtros(filtros, config['filtros_permitidos'])
    
        if categoria in ['familiares', 'empleados']:
            filtros_finales['assignments__Tipo_personal__tipo_personal'] = PERSONAL_ACTIVO
        
        queryset = Model.objects.filter(**filtros_finales).distinct()
        
        queryset = queryset.filter(**{f"{campo_db}__isnull": False})
    
        if tipo_reporte == 'conteo':
            target_count = 'carga_familiar' if categoria == 'familiares' else 'pk'
        
            filtro_conteo = Q()
            for key, value in filtros_finales.items():
                if key.startswith('assignments__'):
                    filtro_conteo &= Q(**{key: value})

            return list(
                queryset.values(label=F(campo_db))
                .annotate(total=Count(
                    target_count, 
                    distinct=True,
                    filter=filtro_conteo  
                ))
                .filter(total__gt=0) 
                .order_by('-total')
            )
      
        return cls._obtener_data_detallada(queryset, categoria, filtros)

    @staticmethod
    def _procesar_filtros(filtros, permitidos):
        filtros_limpios = {}
        hoy = timezone.now().date()
        nulos = {None, "", "undefined", "null"}

        def procesar_edad(valor, es_max, campo_base):
            try:
                anios = int(valor)
                offset = 1 if es_max else 0
                fecha = hoy.replace(year=hoy.year - anios - offset)
                if es_max: 
                    fecha += timedelta(days=1)
                
                campo_raiz = campo_base.replace('__gte', '').replace('__lte', '')
                return {f'{campo_raiz}__{"gte" if es_max else "lte"}': fecha}
            except (ValueError, TypeError):
                return {}

        for k, v in filtros.items():
            if k not in permitidos or v in nulos:
                continue
            
            campo_db = permitidos[k]
            v_final = v

            if isinstance(v, str):
                dt_parseado = parse_datetime(v)
                if dt_parseado:
                    v_final = dt_parseado.date()
                else:
                    d_parseado = parse_date(v)
                    if d_parseado:
                        v_final = d_parseado

            try:
                if "edad_" in k:
                    filtros_limpios.update(procesar_edad(v_final, k == "edad_max", campo_db))
                elif "apn_" in k:
                    filtros_limpios[campo_db] = float(v_final)
                elif any(w in campo_db for w in ['ingreso', 'nacimiento', 'egreso']):
                    filtros_limpios[campo_db] = v_final
                else:
                    filtros_limpios[campo_db] = v_final
            except Exception:
                continue 
        return filtros_limpios

    @classmethod
    def _obtener_data_detallada(cls, queryset, categoria, filtros_finales):
        if categoria == 'asignaciones':
            queryset = queryset.select_related(
                'employee', 'denominacioncargoid', 'denominacioncargoespecificoid',
                'gradoid', 'tiponominaid', 'DireccionGeneral', 'DireccionLinea', 'estatusid'
            )
            return ListerCodigosSerializer(queryset, many=True).data

        elif categoria == 'empleados':
            queryset = queryset.select_related('sexoid', 'estadoCivil').prefetch_related(
                'datos_vivienda_set', 'perfil_salud_set', 'perfil_fisico_set',
                'formacion_academica_set', 'antecedentes_servicio_set',
                'assignments__denominacioncargoid', 'assignments__DireccionGeneral',
                'assignments__DireccionLinea', 'assignments__estatusid'
            )
            return EmployeeDetailSerializer(queryset, many=True).data

        elif categoria == 'egresados':
            queryset = queryset.select_related('employee', 'motivo_egreso').prefetch_related(
                'cargos_historial__denominacioncargoid',
                'cargos_historial__denominacioncargoespecificoid',
                'cargos_historial__gradoid',
                'cargos_historial__tiponominaid',
                'cargos_historial__DireccionGeneral',
                'cargos_historial__DireccionLinea',
                'cargos_historial__OrganismoAdscritoid'
            )
            return PersonalEgresadoSerializer(queryset, many=True).data

        elif categoria == 'familiares':
            return cls._preparar_lista_familiares(queryset, filtros_finales)

    @staticmethod
    def _preparar_lista_familiares(queryset, filtros_finales):
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
            Prefetch('assignments', queryset=AsigModel.objects.filter(
                Tipo_personal__tipo_personal=PERSONAL_ACTIVO 
            ).select_related('denominacioncargoid', 'tiponominaid', 'DireccionGeneral')),
            Prefetch('carga_familiar', queryset=fam_prefetch)
        )
        data = ReporteFamiliarAgrupadoSerializer(queryset, many=True).data
        return [emp for emp in data if emp.get('familiares')]