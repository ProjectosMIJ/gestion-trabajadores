# Exportar serializers desde personal_serializers
from .personal_serializers import (
    DireccionGeneralSerializer,
    DireccionLineaSerializer,
    CoordinacionSerializer,
    TipoNominaSerializer,
    denominacionCargoEspecificoSerializer,
    denominacionCargoSerializer,
    gradoSerializer,
    OrganismoAdscritoSerializer,
)

# Exportar todos los serializers que puedan necesitarse
__all__ = [
    'DireccionGeneralSerializer',
    'DireccionLineaSerializer',
    'CoordinacionSerializer',
    'TipoNominaSerializer',
    'denominacionCargoEspecificoSerializer',
    'denominacionCargoSerializer',
    'gradoSerializer',
    'OrganismoAdscritoSerializer',
]
