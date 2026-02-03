"""
Generador de PDF para reportes de familiares.
Genera una tabla con información de empleados y sus familiares.
"""
from reportlab.platypus import Spacer, Paragraph, PageBreak
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm

from ..base_generator import BasePDFGenerator
from ..templates.styles import PAGE_CONFIG, COLORS, get_paragraph_styles
from ..templates.components import (
    create_header, 
    create_section_title, 
    create_data_table,
    create_stats_box,
    format_date
)


class FamilyPDFGenerator(BasePDFGenerator):
    """
    Generador de PDF para reportes de familiares.
    
    Genera un reporte tabular con los datos del empleado y sus familiares:
    
    Datos del empleado:
    - Cédula de identidad
    - Nombres y apellidos
    
    Datos del familiar:
    - Cédula del familiar
    - Nombres y apellidos
    - Parentesco
    - Fecha de nacimiento
    - Sexo
    - Heredero (Sí/No)
    """
    
    def __init__(self, employees, title="Reporte de Familiares", filters=None):
        """
        Inicializa el generador de PDF de familiares.
        
        Args:
            employees: QuerySet o lista de empleados con sus familiares
            title: Título del reporte
            filters: Diccionario con los filtros aplicados
        """
        super().__init__(
            data=employees,
            title=title,
            orientation='landscape',
            metadata={'filters': filters or {}}
        )
        
        self.employees = list(employees) if hasattr(employees, '__iter__') else []
        self.filters = filters or {}
        self.styles = get_paragraph_styles()
    
    def _get_footer_text(self):
        """Retorna el texto para el footer."""
        total_empleados = len(self.employees)
        total_familiares = sum(self._get_familiares_count(e) for e in self.employees)
        return f"Empleados: {total_empleados} | Familiares: {total_familiares} | Generado: {self.generated_at.strftime('%d/%m/%Y %H:%M')}"
    
    def _generate_filename(self):
        """Genera el nombre del archivo."""
        date_str = self.generated_at.strftime('%Y%m%d_%H%M')
        return f"reporte_familiares_{date_str}.pdf"
    
    def _build_content(self):
        """Construye el contenido del PDF."""
        story = []
        
        # Agregar encabezado con estadísticas
        story.extend(self._build_header_section())
        
        # Agregar sección de filtros aplicados (si hay)
        if self.filters:
            story.extend(self._build_filters_section())
        
        # Agregar tabla de familiares
        story.extend(self._build_family_table())
        
        return story
    
    def _build_header_section(self):
        """Construye la sección del encabezado con estadísticas."""
        elements = []
        
        elements.append(Spacer(1, 10))
        
        # Estadísticas generales
        total_empleados = len(self.employees)
        total_familiares = sum(self._get_familiares_count(e) for e in self.employees)
        
        # Contar herederos
        herederos = 0
        mismo_ente = 0
        for emp in self.employees:
            for fam in self._get_familiares(emp):
                if self._get_heredero(fam):
                    herederos += 1
                if self._get_mismo_ente(fam):
                    mismo_ente += 1
        
        stats = {
            'Total Empleados': total_empleados,
            'Total Familiares': total_familiares,
            'Herederos': herederos,
            'Mismo Ente': mismo_ente,
        }
        
        width = self._get_available_width()
        stats_box = create_stats_box(stats, width)
        elements.append(stats_box)
        elements.append(Spacer(1, 15))
        
        return elements
    
    def _build_filters_section(self):
        """Construye la sección de filtros aplicados."""
        elements = []
        
        filter_text_parts = []
        for key, value in self.filters.items():
            if value:
                filter_text_parts.append(f"{key}: {value}")
        
        if filter_text_parts:
            elements.extend(create_section_title("Filtros Aplicados"))
            filter_text = " | ".join(filter_text_parts)
            elements.append(Paragraph(filter_text, self.styles['Small']))
            elements.append(Spacer(1, 10))
        
        return elements
    
    def _build_family_table(self):
        """Construye la tabla de familiares."""
        elements = []
        
        elements.extend(create_section_title("Listado de Familiares"))
        
        if not self.employees:
            elements.append(Paragraph(
                "No se encontraron empleados con familiares registrados.",
                self.styles['Body']
            ))
            return elements
        
        # Definir encabezados
        headers = [
            '#',
            'Cédula Emp.',
            'Empleado',
            'Cédula Fam.',
            'Familiar',
            'Parentesco',
            'F. Nacimiento',
            'Sexo',
            'Heredero',
            'Mismo Ente'
        ]
        
        # Anchos de columna para landscape A4
        col_widths = [
            10 * mm,   # #
            22 * mm,   # Cédula Emp.
            45 * mm,   # Empleado
            22 * mm,   # Cédula Fam.
            45 * mm,   # Familiar
            28 * mm,   # Parentesco
            22 * mm,   # F. Nacimiento
            14 * mm,   # Sexo
            18 * mm,   # Heredero
            22 * mm,   # Mismo Ente
        ]
        
        # Construir filas de datos
        rows = []
        idx = 0
        
        for employee in self.employees:
            familiares = self._get_familiares(employee)
            
            if not familiares:
                continue
            
            cedula_emp = self._get_cedula_empleado(employee)
            nombre_emp = self._get_nombre_empleado(employee)
            
            for familiar in familiares:
                idx += 1
                row = [
                    str(idx),
                    cedula_emp,
                    nombre_emp,
                    self._get_cedula_familiar(familiar),
                    self._get_nombre_familiar(familiar),
                    self._get_parentesco(familiar),
                    self._get_fecha_nacimiento(familiar),
                    self._get_sexo(familiar),
                    'Sí' if self._get_heredero(familiar) else 'No',
                    'Sí' if self._get_mismo_ente(familiar) else 'No',
                ]
                rows.append(row)
        
        if not rows:
            elements.append(Paragraph(
                "No se encontraron familiares con los filtros aplicados.",
                self.styles['Body']
            ))
            return elements
        
        # Crear tabla
        table = create_data_table(headers, rows, col_widths, with_alternating_rows=True)
        elements.append(table)
        
        return elements
    
    # =========================================================================
    # Métodos auxiliares para extraer datos
    # =========================================================================
    
    def _get_familiares(self, employee):
        """Obtiene la lista de familiares del empleado."""
        if isinstance(employee, dict):
            return employee.get('carga_familiar', []) or employee.get('familiares', [])
        
        # Si es un modelo Django
        if hasattr(employee, 'carga_familiar'):
            return employee.carga_familiar.all()
        return []
    
    def _get_familiares_count(self, employee):
        """Cuenta los familiares del empleado."""
        familiares = self._get_familiares(employee)
        if hasattr(familiares, 'count'):
            return familiares.count()
        return len(familiares) if familiares else 0
    
    def _get_cedula_empleado(self, employee):
        """Extrae la cédula del empleado."""
        if isinstance(employee, dict):
            return str(employee.get('cedulaidentidad', 'N/A'))
        return str(getattr(employee, 'cedulaidentidad', 'N/A'))
    
    def _get_nombre_empleado(self, employee):
        """Extrae el nombre completo del empleado."""
        if isinstance(employee, dict):
            nombres = employee.get('nombres', '')
            apellidos = employee.get('apellidos', '')
        else:
            nombres = getattr(employee, 'nombres', '')
            apellidos = getattr(employee, 'apellidos', '')
        
        return f"{nombres} {apellidos}".strip() or 'N/A'
    
    def _get_cedula_familiar(self, familiar):
        """Extrae la cédula del familiar."""
        if isinstance(familiar, dict):
            return str(familiar.get('cedulaFamiliar', 'N/A') or 'N/A')
        cedula = getattr(familiar, 'cedulaFamiliar', None)
        return str(cedula) if cedula else 'N/A'
    
    def _get_nombre_familiar(self, familiar):
        """Extrae el nombre completo del familiar."""
        if isinstance(familiar, dict):
            p_nombre = familiar.get('primer_nombre', '')
            s_nombre = familiar.get('segundo_nombre', '') or ''
            p_apellido = familiar.get('primer_apellido', '')
            s_apellido = familiar.get('segundo_apellido', '') or ''
        else:
            p_nombre = getattr(familiar, 'primer_nombre', '')
            s_nombre = getattr(familiar, 'segundo_nombre', '') or ''
            p_apellido = getattr(familiar, 'primer_apellido', '')
            s_apellido = getattr(familiar, 'segundo_apellido', '') or ''
        
        nombre = f"{p_nombre} {s_nombre}".strip()
        apellido = f"{p_apellido} {s_apellido}".strip()
        return f"{nombre} {apellido}".strip() or 'N/A'
    
    def _get_parentesco(self, familiar):
        """Extrae el parentesco."""
        if isinstance(familiar, dict):
            parentesco = familiar.get('parentesco', {})
            if isinstance(parentesco, dict):
                return parentesco.get('descripcion_parentesco', 'N/A')
            return str(parentesco) if parentesco else 'N/A'
        
        parentesco_obj = getattr(familiar, 'parentesco', None)
        if parentesco_obj:
            return getattr(parentesco_obj, 'descripcion_parentesco', 'N/A')
        return 'N/A'
    
    def _get_fecha_nacimiento(self, familiar):
        """Extrae y formatea la fecha de nacimiento."""
        if isinstance(familiar, dict):
            fecha = familiar.get('fechanacimiento')
        else:
            fecha = getattr(familiar, 'fechanacimiento', None)
        return format_date(fecha)
    
    def _get_sexo(self, familiar):
        """Extrae el sexo del familiar."""
        if isinstance(familiar, dict):
            sexo = familiar.get('sexo', {})
            if isinstance(sexo, dict):
                return sexo.get('sexo', 'N/A')
            return str(sexo) if sexo else 'N/A'
        
        sexo_obj = getattr(familiar, 'sexo', None)
        if sexo_obj:
            return getattr(sexo_obj, 'sexo', 'N/A')
        return 'N/A'
    
    def _get_estado_civil(self, familiar):
        """Extrae el estado civil del familiar."""
        if isinstance(familiar, dict):
            estado = familiar.get('estadoCivil', {})
            if isinstance(estado, dict):
                return estado.get('estadoCivil', 'N/A')
            return str(estado) if estado else 'N/A'
        
        estado_obj = getattr(familiar, 'estadoCivil', None)
        if estado_obj:
            return getattr(estado_obj, 'estadoCivil', 'N/A')
        return 'N/A'
    
    def _get_heredero(self, familiar):
        """Verifica si es heredero."""
        if isinstance(familiar, dict):
            return familiar.get('heredero', False)
        return getattr(familiar, 'heredero', False)
    
    def _get_mismo_ente(self, familiar):
        """Verifica si trabaja en el mismo ente."""
        if isinstance(familiar, dict):
            return familiar.get('mismo_ente', False)
        return getattr(familiar, 'mismo_ente', False)
