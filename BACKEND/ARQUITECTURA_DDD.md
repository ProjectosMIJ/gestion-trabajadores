# Arquitectura Domain Driven Design - Gestion Trabajadores Backend

## 1. Estructura del Proyecto

```
BACKEND/
├── SIGEP/                    # Configuracion del Proyecto Django
│   ├── settings.py           # Configuracion Django
│   ├── urls.py               # Enrutamiento raiz
│   ├── wsgi.py               # Punto de entrada WSGI
│   └── asgi.py               # Punto de entrada ASGI
│
├── RAC/                      # Contexto Delimitado: Registro de Personal Activo
│   ├── models/               # Capa Dominio - Entidades y Agregados
│   │   ├── personal_models.py
│   │   ├── family_personal_models.py
│   │   ├── ubicacion_models.py
│   │   └── historial_personal_models.py
│   │
│   ├── services/            # Capa Aplicacion/Infraestructura
│   │   ├── constants.py              # Objetos Valor
│   │   ├── constants_historial.py    # Constantes de historial
│   │   ├── generacion_codigo.py      # Patron Factory
│   │   └── pdf/                     # Generacion de PDFs
│   │       ├── base_generator.py     # Clase Base Abstracta
│   │       └── generators/          # Generadores Concretos
│   │
│   ├── serializers/          # Capa Aplicacion - DTOs/Mapeadores
│   │   ├── personal_activo_serializers.py
│   │   ├── personal_pasivo_serializers.py
│   │   ├── family_serializers.py
│   │   ├── historial_personal_serializers.py
│   │   └── report_serializers.py
│   │
│   ├── views/                # Capa Presentacion - Controladores API
│   │   ├── personal_activo_views.py
│   │   ├── personal_pasivo_views.py
│   │   ├── family_views.py
│   │   ├── historial_views.py
│   │   ├── report_active_views.py
│   │   ├── report_passive_views.py
│   │   ├── carga_excel_views.py
│   │   └── ubicacion_views.py
│   │
│   ├── filters/              # Infraestructura de Consultas
│   │   └── filters_personal.py
│   │
│   └── urls.py               # Enrutamiento del modulo
│
├── USER/                     # Contexto Delimitado: Gestion de Usuarios
│   ├── models/
│   │   └── user_models.py    # cuenta, departamentos, Roles
│   ├── serializers/
│   │   └── USER_serializers.py
│   ├── views/
│   │   └── user_views.py
│   └── urls.py
│
├── manage.py
├── requirements.txt
└── db.sqlite3
```

---

## 2. Capas DDD Identificadas

| Capa                | Ubicacion                           | Proposito                                        |
| ------------------- | ----------------------------------- | ------------------------------------------------ |
| **Dominio**         | `RAC/models/`                       | Entidades, Objetos Valor, Agregados              |
| **Aplicacion**      | `RAC/services/`, `RAC/serializers/` | Casos de Uso, DTOs, Servicios de Aplicacion      |
| **Infraestructura** | `RAC/filters/`, `RAC/services/pdf/` | Persistencia, Servicios Externos, Generacion PDF |
| **Presentacion**    | `RAC/views/`                        | Controladores API, Manejadores HTTP              |

---

## 3. Patrones de Diseno Encontrados

### 3.1 Entidades (Nucleo DDD)

| Entidad                     | Archivo                           | Propiedades Clave                             |
| --------------------------- | --------------------------------- | --------------------------------------------- |
| **Employee**                | `personal_models.py:367`          | Raiz del agregado principal para trabajadores |
| **AsigTrabajo**             | `personal_models.py:400`          | Asignacion de trabajo (Cargo) - agregado      |
| **Employeefamily**          | `family_personal_models.py:20`    | Agregado de familiar                          |
| **EmployeeMovementHistory** | `historial_personal_models.py:20` | Historial de movimientos de audit             |
| **EmployeeEgresado**        | `historial_personal_models.py:60` | Registro de empleado egresado                 |

### 3.2 Objetos Valor (Inmutables)

```python
# constants.py
ESTATUS_ACTIVO = "ACTIVO"
ESTATUS_VACANTE = "VACANTE"
PERSONAL_ACTIVO = "ACTIVO"
PERSONAL_PASIVO = "PASIVO"

```

### 3.3 Patron Repository

El ORM de Django acta como implementacion del repositorio:

- `Employee.objects.filter(...)`
- `AsigTrabajo.objects.select_related(...)`
- `Employeefamily.objects.prefetch_related(...)`

### 3.4 Patron Factory

**Servicio Generador de Codigos:**

```python
# RAC/services/generacion_codigo.py
def generador_codigos(prefix):
    """Factory function para generar codigos secuenciales"""
    ultima_asignacion = AsigTrabajo.objects.filter(
        codigo__startswith=prefix
    ).order_by('-codigo').first()
    # ... genera siguiente codigo secuencial
```

### 3.5 Abstract Factory (Template Method)

**Generador Base PDF:**

```python
# RAC/services/pdf/base_generator.py
class BasePDFGenerator(ABC):
    """Clase Base Abstracta con Patron Template Method"""

    @abstractmethod
    def _build_content(self):  # Debe ser implementado por subclasses
        pass

    def generate(self):        # Metodo plantilla
        doc = self._create_document()
        self.story = self._build_content()  # Hook para subclasses
        doc.build(self.story, ...)
```

**Generadores Concretos:**

- `EmployeePDFGenerator`
- `FamilyPDFGenerator`
- `AssignmentPDFGenerator`
- `GraduatePDFGenerator`

### 3.6 Patron Mixin

```python
# RAC/serializers/personal_activo_serializers.py
class CleanZerosMixin:
    """Mixin para limpiar valores nulos/zero de la entrada"""
    def to_internal_value(self, data):
        # ... logica de limpieza
```

### 3.7 Patron Estrategia

**Estrategia de Filtros:**

```python
# RAC/filters/filters_personal.py
class EmployeeFilter(django_filters.FilterSet):
    """Estrategia para filtrar empleados"""
    codigo = django_filters.CharFilter(field_name='assignments__codigo')
    dependencia_id = django_filters.NumberFilter(...)
```

### 3.8 Patron Transaction Script

Utilizado extensivamente en serializers para operaciones de negocio complejas:

```python
@transaction.atomic
def create(self, validated_data):
    # Logica de transaccion compleja
```

---

## 4. Componentes Clave y Responsabilidades

### 4.1 Capa Dominio (Models)

#### Agregados Principales:

**Employee - Raiz del Agregado:**

```python
class Employee(models.Model):
    # Identidad central
    cedulaidentidad: str (unico)
    nombres, apellidos: str

    # Objetos valor
    fecha_nacimiento, fecha_ingreso_organismo
    sexo, estado_civil

    # Relaciones
    assignments: List[AsigTrabajo]       # Posiciones de trabajo
    carga_familiar: List[Employeefamily] # Miembros de familia
    datos_vivienda_set                  # Informacion de direccion
    perfil_salud_set                    # Perfil de salud
    perfil_fisico_set                   # Perfil fisico
    formacion_academica_set             # Educacion
    movimientos                          # Historial de movimientos
```

**AsigTrabajo - Agregado:**

```python
class AsigTrabajo(models.Model):
    # Identidad
    codigo: str (unico por tipo de nomina)

    # Detalles del cargo
    denominacioncargo: Nombre del cargo
    denominacioncargoespecifico: Cargo especifico
    grado: Grado salarial

    # Jerarquia organizacional
    Dependencia -> DireccionGeneral -> DireccionLinea -> Coordinacion

    # Estado
    estatus: ACTIVO | VACANTE | BLOQUEADO | SUSPENDIDO | EGRESADO
    tipo_personal: ACTIVO | PASIVO
    tiponomina: Tipo de nomina

```

### 4.2 Servicios de Aplicacion

| Servicio                 | Proposito                                           |
| ------------------------ | --------------------------------------------------- |
| `generacion_codigo.py`   | Factory para generar codigos secuenciales de cargos |
| `constants.py`           | Constantes/Objetos valor del dominio                |
| `constants_historial.py` | Servicio de registro de auditoria                   |
| `mapa_reporte.py`        | Configuracion y mapeo de campos de reportes         |
| `pdf/base_generator.py`  | Plantilla abstracta para generacion PDF             |
| `pdf/generators/*`       | Implementaciones concretas de generadores PDF       |

### 4.3 Serializers (DTOs y Mapeadores)

**Jerarquia de Serializers:**

```
BaseSerializer
├── CleanZerosMixin
│   ├── EmployeeCreateUpdateSerializer
│   ├── CodigosCreateUpdateSerializer
│   ├── SpecialPositionAutoCreateSerializer
│   └── CoordinacionSerializer
├── EmployeeListSerializer
├── EmployeeDetailSerializer
├── FamilyCreateSerializer
├── FamilyListSerializer
└── ReportSerializers...
```

**Patrones Clave de Serializers:**

1. **Manejo de Objetos Anidados:**

```python
class EmployeeCreateUpdateSerializer:
    datos_vivienda = DatosViviendaSerializer(required=False)
    perfil_salud = PerfilSaludSerializer(required=False)
    contacto_emergencia = ContactoEmergenciaSerializer(many=True)

    def _handle_nested_data(self, instance, nested):
        # Actualizar/crear objetos anidados
```

2. **Validacion Personalizada:**

```python
def validate_cedulaidentidad(self, value):
    if self.instance and self.instance.cedulaidentidad != value:
        raise serializers.ValidationError("No se puede modificar el ID")
    return value
```

3. **Reglas de Negocio Complejas:**

```python
def validate(self, attrs):
    # Validacion entre campos
    # Validacion de relaciones jerarquicas
```

### 4.4 Views (Controladores API)

**Patron de Vista:**

```python
@extend_schema(
    tags=["..."],
    summary="...",
    description="..."
)
@api_view(['POST', 'GET', 'PATCH', 'DELETE'])
def controller_function(request, ...):
    # 1. Validacion de entrada via serializer
    # 2. Ejecucion de logica de negocio
    # 3. Formateo de respuesta
```

**Categorias de API:**

- Gestion de Personal (CRUD de Empleados)
- Gestion de Posiciones (AsigTrabajo)
- Gestion Familiar (Employeefamily)
- Gestion de Movimientos/Transiciones
- Generacion de Reportes (PDF/Excel)

---

## 5. Limites de Modulos (Contextos Delimitados)

| Contexto  | Modulos   | Dominio                                          |
| --------- | --------- | ------------------------------------------------ |
| **RAC**   | `RAC/*`   | Registro de Personal, Asignaciones, Movimientos  |
| **USER**  | `USER/*`  | Autenticacion, Autorizacion, Gestion de Usuarios |
| **SIGEP** | `SIGEP/*` | Configuracion del Proyecto Django, Settings      |

---

## 6. Resumen de Patrones Arquitectonicos

| Patron                     | Implementacion                                                 | Ubicacion                        |
| -------------------------- | -------------------------------------------------------------- | -------------------------------- |
| **Arquitectura por Capas** | Capas DDD (Dominio, Aplicacion, Infraestructura, Presentacion) | Por directorio                   |
| **Patron Aggregate**       | Employee -> AsigTrabajo -> EmployeeMovementHistory             | `models/`                        |
| **Patron Repository**      | ORM de Django como abstraccion de repositorio                  | Todas las consultas de modelos   |
| **Patron Factory**         | Servicio de generacion de codigos                              | `services/generacion_codigo.py`  |
| **Template Method**        | Clase abstracta BasePDFGenerator                               | `services/pdf/base_generator.py` |
| **Patron Estrategia**      | Clases de filtros                                              | `filters/`                       |
| **Patron Mixin**           | CleanZerosMixin                                                | `serializers/`                   |
| **Transaction Script**     | Metodos create/update de serializers                           | `serializers/`                   |
| **Patron Audit**           | simple_history + \_history_user personalizado                  | Models                           |

---

## 7. Flujo de Datos Ejemplo

```
Solicitud HTTP
    ↓
View (Controlador)
    ↓ (deserializar + validar)
Serializer (DTO + Validacion)
    ↓ (logica de negocio + transacciones)
Modelos de Dominio (Entidades + Agregados)
    ↓ (operaciones ORM)
Repositorio (ORM de Django)
    ↓
Base de Datos (PostgreSQL)
```

---

## 8. Diagrama de Arquitectura DDD

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                     PRESENTACION (Views)                                             │
│  personal_activo_views.py,personal_pasivo_views.py, family_views.py, historial_views │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
            ┌──────────────────────────────────────────────────────────────┐
            │                   APLICACION (Serializers)                   │
            │  EmployeeCreateUpdateSerializer, FamilyListSerializer, etc.  │
            │              Transaccion Script, Validacion                  │
            └──────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
            ┌─────────────────────────────────────────────────────────────┐
            │                      DOMINIO (Models)                       │
            │     Employee (Raiz), AsigTrabajo, Employeefamily            │
            │              Entidades, Agregados, Objetos Valor            │
            └─────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
            ┌─────────────────────────────────────────────────────────────┐
            │                  INFRAESTRUCTURA (Services)                 │
            │   PDF Generators, Code Factory, Filters, Report Maps        │
            │                   Repository (Django ORM)                   │
            └─────────────────────────────────────────────────────────────┘
```

---

## 9. Contextos Delimitados (Bounded Contexts)

```
┌─────────────────┐     ┌─────────────────┐
│   CONTEXTO RAC  │     │  CONTEXTO USER  │
│                 │     │                 │
│  - Employee     │     │  - cuenta       │
│  - AsigTrabajo  │     │  - departaments │
│  - Family       │     │  - Rol          │
│  - History      │     │  - Permisos     │
│  - Reports      │     │  - Auth         │
│                 │     │                 │
│  Dominio:       │     │  Dominio:       │
│  Personal       │     │  Usuarios y     │
│                 │     │  Autenticacion  │
└─────────────────┘     └─────────────────┘
```

---

Esta arquitectura sigue los principios de DDD con una clara separacion de responsabilidades, utilizando el patron MTV de Django mientras incorpora patrones de diseno adicionales para operaciones de negocio complejas como generacion de PDFs, secuenciacion de codigos y seguimiento historico.
