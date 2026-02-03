import django_filters
from ..models import Employee, AsigTrabajo


class EmployeeFilter(django_filters.FilterSet):
    cedulaidentidad = django_filters.CharFilter( lookup_expr='icontains')
    codigo = django_filters.CharFilter(field_name='assignments__codigo', lookup_expr='icontains')
    tipo_nomina = django_filters.NumberFilter(field_name='assignments__tiponominaid')
    dependencia_id = django_filters.NumberFilter(field_name='assignments__DireccionGeneral__dependenciaId')
    direccion_general_id = django_filters.NumberFilter(field_name='assignments__DireccionGeneral')
    direccion_linea_id = django_filters.NumberFilter(field_name='assignments__DireccionLinea')
    coordinacion_id = django_filters.NumberFilter(field_name='assignments__Coordinacion')

    class Meta:
        model = Employee
        fields = []
        
        
        
class AsigTrabajoFilter(django_filters.FilterSet):
    codigo = django_filters.CharFilter(lookup_expr='icontains')
    estatus_id = django_filters.NumberFilter(field_name='estatusid')
    tipo_nomina = django_filters.NumberFilter(field_name='tiponominaid')
    dependencia_id = django_filters.NumberFilter(field_name='DireccionGeneral__dependenciaId')
    direccion_general = django_filters.NumberFilter(field_name='DireccionGeneral')
    direccion_linea = django_filters.NumberFilter(field_name='DireccionLinea')
    coordinacion = django_filters.NumberFilter(field_name='Coordinacion')

    class Meta:
        model = AsigTrabajo
        fields = []