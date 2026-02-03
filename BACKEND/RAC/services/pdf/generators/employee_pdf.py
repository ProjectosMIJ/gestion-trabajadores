"""
Generador de PDF para reportes de empleados.
Genera una tabla con información básica de empleados.
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


class EmployeePDFGenerator(BasePDFGenerator):
    """
    Generador de PDF para reportes de empleados.
    
    Genera un reporte tabular con los campos básicos:
    - Cédula de identidad
    - Nombres
    - Apellidos
    - Fecha de nacimiento
    - Fecha de ingreso al organismo
    - Años en APN
    - N° de contrato
    - Sexo
    - Estado civil
    """
    
    # Número de empleados por página (aproximado)
    EMPLOYEES_PER_PAGE = 35
    
    def __init__(self, employees, title="Reporte de Empleados", filters=None):
        """
        Inicializa el generador de PDF de empleados.
        
        Args:
            employees: QuerySet o lista de empleados
            title: Título del reporte
            filters: Diccionario con los filtros aplicados (para mostrar en el reporte)
        """
        super().__init__(
            data=employees,
            title=title,
            orientation='landscape',  # Usar landscape para más columnas
            metadata={'filters': filters or {}}
        )
        
        self.employees = list(employees) if hasattr(employees, '__iter__') else []
        self.filters = filters or {}
        self.styles = get_paragraph_styles()
    
    def _get_footer_text(self):
        """Retorna el texto para el footer."""
        total = len(self.employees)
        return f"Total de empleados: {total} | Generado: {self.generated_at.strftime('%d/%m/%Y %H:%M')}"
    
    def _generate_filename(self):
        """Genera el nombre del archivo."""
        date_str = self.generated_at.strftime('%Y%m%d_%H%M')
        return f"reporte_empleados_{date_str}.pdf"
    
    def _build_content(self):
        """Construye el contenido del PDF."""
        story = []
        
        # Agregar encabezado con estadísticas
        story.extend(self._build_header_section())
        
        # Agregar sección de filtros aplicados (si hay)
        if self.filters:
            story.extend(self._build_filters_section())
        
        # Agregar tabla de empleados
        story.extend(self._build_employees_table())
        
        return story
    
    def _build_header_section(self):
        """Construye la sección del encabezado con estadísticas."""
        elements = []
        
        # Espaciado inicial
        elements.append(Spacer(1, 10))
        
        # Estadísticas generales
        total_empleados = len(self.employees)
        
        # Contar por sexo
        masculino = sum(1 for e in self.employees if self._get_sexo(e) == 'M')
        femenino = sum(1 for e in self.employees if self._get_sexo(e) == 'F')
        
        stats = {
            'Total Empleados': total_empleados,
            'Masculino': masculino,
            'Femenino': femenino,
        }
        
        width = self._get_available_width()
        stats_box = create_stats_box(stats, width)
        elements.append(stats_box)
        elements.append(Spacer(1, 15))
        
        return elements
    
    def _build_filters_section(self):
        """Construye la sección de filtros aplicados."""
        elements = []
        
        # Solo mostrar si hay filtros
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
    
    def _build_employees_table(self):
        """Construye la tabla de empleados."""
        elements = []
        
        # Título de sección
        elements.extend(create_section_title("Listado de Empleados"))
        
        if not self.employees:
            elements.append(Paragraph(
                "No se encontraron empleados con los filtros aplicados.",
                self.styles['Body']
            ))
            return elements
        
        # Definir encabezados
        headers = [
            '#',
            'Cédula',
            'Nombres',
            'Apellidos',
            'F. Nacimiento',
            'F. Ingreso',
            'Años APN',
            'N° Contrato',
            'Sexo',
            'Estado Civil'
        ]
        
        # Definir anchos de columna (en mm, ajustados para landscape A4)
        # Landscape A4: 297mm ancho - márgenes (40mm) = 257mm disponibles
        col_widths = [
            12 * mm,   # #
            22 * mm,   # Cédula
            45 * mm,   # Nombres
            45 * mm,   # Apellidos
            22 * mm,   # F. Nacimiento
            22 * mm,   # F. Ingreso
            18 * mm,   # Años APN
            22 * mm,   # N° Contrato
            15 * mm,   # Sexo
            30 * mm,   # Estado Civil
        ]
        
        # Construir filas de datos
        rows = []
        for idx, employee in enumerate(self.employees, start=1):
            row = [
                str(idx),
                self._get_cedula(employee),
                self._get_nombres(employee),
                self._get_apellidos(employee),
                self._get_fecha_nacimiento(employee),
                self._get_fecha_ingreso(employee),
                self._get_anos_apn(employee),
                self._get_n_contrato(employee),
                self._get_sexo(employee),
                self._get_estado_civil(employee),
            ]
            rows.append(row)
        
        # Crear tabla
        table = create_data_table(headers, rows, col_widths, with_alternating_rows=True)
        elements.append(table)
        
        return elements
    
    # =========================================================================
    # Métodos auxiliares para extraer datos del empleado
    # =========================================================================
    
    def _get_cedula(self, employee):
        """Extrae la cédula de identidad."""
        if isinstance(employee, dict):
            return str(employee.get('cedulaidentidad', 'N/A'))
        return str(getattr(employee, 'cedulaidentidad', 'N/A'))
    
    def _get_nombres(self, employee):
        """Extrae los nombres."""
        if isinstance(employee, dict):
            return employee.get('nombres', 'N/A')
        return getattr(employee, 'nombres', 'N/A')
    
    def _get_apellidos(self, employee):
        """Extrae los apellidos."""
        if isinstance(employee, dict):
            return employee.get('apellidos', 'N/A')
        return getattr(employee, 'apellidos', 'N/A')
    
    def _get_fecha_nacimiento(self, employee):
        """Extrae y formatea la fecha de nacimiento."""
        if isinstance(employee, dict):
            fecha = employee.get('fecha_nacimiento')
        else:
            fecha = getattr(employee, 'fecha_nacimiento', None)
        return format_date(fecha)
    
    def _get_fecha_ingreso(self, employee):
        """Extrae y formatea la fecha de ingreso."""
        if isinstance(employee, dict):
            fecha = employee.get('fechaingresoorganismo')
        else:
            fecha = getattr(employee, 'fechaingresoorganismo', None)
        return format_date(fecha)
    
    def _get_anos_apn(self, employee):
        """Extrae los años en APN."""
        if isinstance(employee, dict):
            anos = employee.get('total_anos_apn', employee.get('anos_apn', 'N/A'))
        else:
            anos = getattr(employee, 'total_anos_apn', 'N/A')
        return str(anos) if anos is not None else 'N/A'
    
    def _get_n_contrato(self, employee):
        """Extrae el número de contrato."""
        if isinstance(employee, dict):
            return str(employee.get('n_contrato', 'N/A') or 'N/A')
        contrato = getattr(employee, 'n_contrato', None)
        return str(contrato) if contrato else 'N/A'
    
    def _get_sexo(self, employee):
        """Extrae el sexo."""
        if isinstance(employee, dict):
            sexo = employee.get('sexo', {})
            if isinstance(sexo, dict):
                return sexo.get('sexo', 'N/A')
            return str(sexo) if sexo else 'N/A'
        
        # Si es un objeto modelo
        sexo_obj = getattr(employee, 'sexoid', None)
        if sexo_obj:
            return getattr(sexo_obj, 'sexo', 'N/A')
        return 'N/A'
    
    def _get_estado_civil(self, employee):
        """Extrae el estado civil."""
        if isinstance(employee, dict):
            estado = employee.get('estadoCivil', {})
            if isinstance(estado, dict):
                return estado.get('estadoCivil', 'N/A')
            return str(estado) if estado else 'N/A'
        
        # Si es un objeto modelo
        estado_obj = getattr(employee, 'estadoCivil', None)
        if estado_obj:
            return getattr(estado_obj, 'estadoCivil', 'N/A')
        return 'N/A'
