from .personal_views import *
from .ubicacion_views import *
from .family_views import *
from .historial_views import *

__all__ = [
	*[name for name in globals() if not name.startswith("_")]
]
