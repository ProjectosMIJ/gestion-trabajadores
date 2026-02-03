"""
Generador de PDF para reportes de asignaciones/códigos.
Genera una tabla con información de asignaciones de cargos.
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


class AssignmentPDFGenerator(BasePDFGenerator):
    """
    Generador de PDF para reportes de asignaciones/códigos.
    
    Genera un reporte tabular con los datos de asignaciones:
    - Código
    - Empleado (cédula y nombre)
    - Cargo
    - Cargo específico
    - Grado
    - Tipo de nómina
    - Dirección General
    - Estatus
    """
    
    def __init__(self, assignments, title="Reporte de Asignaciones", filters=None):
        """
        Inicializa el generador de PDF de asignaciones.
        
        Args:
            assignments: QuerySet o lista de asignaciones
            title: Título del reporte
            filters: Diccionario con los filtros aplicados
        """
        super().__init__(
            data=assignments,
            title=title,
            orientation='landscape',
            metadata={'filters': filters or {}}
        )
        
        self.assignments = list(assignments) if hasattr(assignments, '__iter__') else []
        self.filters = filters or {}
        self.styles = get_paragraph_styles()
    
    def _get_footer_text(self):
        """Retorna el texto para el footer."""
        total = len(self.assignments)
        return f"Total de asignaciones: {total} | Generado: {self.generated_at.strftime('%d/%m/%Y %H:%M')}"
    
    def _generate_filename(self):
        """Genera el nombre del archivo."""
        date_str = self.generated_at.strftime('%Y%m%d_%H%M')
        return f"reporte_asignaciones_{date_str}.pdf"
    
    def _build_content(self):
        """Construye el contenido del PDF."""
        story = []
        
        # Agregar encabezado con estadísticas
        story.extend(self._build_header_section())
        
        # Agregar sección de filtros aplicados (si hay)
        if self.filters:
            story.extend(self._build_filters_section())
        
        # Agregar tabla de asignaciones
        story.extend(self._build_assignments_table())
        
        return story
    
    def _build_header_section(self):
        """Construye la sección del encabezado con estadísticas."""
        elements = []
        
        elements.append(Spacer(1, 10))
        
        # Estadísticas generales
        total_asignaciones = len(self.assignments)
        
        # Contar por estatus
        ocupados = sum(1 for a in self.assignments if self._get_estatus(a).upper() == 'ACTIVO')
        vacantes = sum(1 for a in self.assignments if self._get_estatus(a).upper() == 'VACANTE')
        
        stats = {
            'Total Asignaciones': total_asignaciones,
            'Ocupados': ocupados,
            'Vacantes': vacantes,
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
    
    def _build_assignments_table(self):
        """Construye la tabla de asignaciones."""
        elements = []
        
        elements.extend(create_section_title("Listado de Asignaciones"))
        
        if not self.assignments:
            elements.append(Paragraph(
                "No se encontraron asignaciones con los filtros aplicados.",
                self.styles['Body']
            ))
            return elements
        
        # Definir encabezados
        headers = [
            '#',
            'Código',
            'Cédula',
            'Empleado',
            'Cargo',
            'Cargo Esp.',
            'Grado',
            'Nómina',
            'Dirección',
            'Estatus'
        ]
        
        # Anchos de columna para landscape A4
        col_widths = [
            10 * mm,   # #
            25 * mm,   # Código
            22 * mm,   # Cédula
            40 * mm,   # Empleado
            35 * mm,   # Cargo
            35 * mm,   # Cargo Esp.
            15 * mm,   # Grado
            25 * mm,   # Nómina
            30 * mm,   # Dirección
            18 * mm,   # Estatus
        ]
        
        # Construir filas de datos
        rows = []
        
        for idx, assignment in enumerate(self.assignments, start=1):
            row = [
                str(idx),
                self._get_codigo(assignment),
                self._get_cedula_empleado(assignment),
                self._get_nombre_empleado(assignment),
                self._get_cargo(assignment),
                self._get_cargo_especifico(assignment),
                self._get_grado(assignment),
                self._get_tipo_nomina(assignment),
                self._get_direccion(assignment),
                self._get_estatus(assignment),
            ]
            rows.append(row)
        
        # Crear tabla
        table = create_data_table(headers, rows, col_widths, with_alternating_rows=True)
        elements.append(table)
        
        return elements
    
    # =========================================================================
    # Métodos auxiliares para extraer datos
    # =========================================================================
    
    def _get_codigo(self, assignment):
        """Extrae el código de asignación."""
        if isinstance(assignment, dict):
            return str(assignment.get('codigo', 'N/A'))
        return str(getattr(assignment, 'codigo', 'N/A'))
    
    def _get_cedula_empleado(self, assignment):
        """Extrae la cédula del empleado asignado."""
        if isinstance(assignment, dict):
            employee = assignment.get('employee', {})
            if isinstance(employee, dict):
                return str(employee.get('cedulaidentidad', 'Vacante'))
            return str(employee) if employee else 'Vacante'
        
        employee = getattr(assignment, 'employee', None)
        if employee:
            return str(getattr(employee, 'cedulaidentidad', 'N/A'))
        return 'Vacante'
    
    def _get_nombre_empleado(self, assignment):
        """Extrae el nombre del empleado asignado."""
        if isinstance(assignment, dict):
            employee = assignment.get('employee', {})
            if isinstance(employee, dict):
                nombres = employee.get('nombres', '')
                apellidos = employee.get('apellidos', '')
                nombre = f"{nombres} {apellidos}".strip()
                return nombre if nombre else 'Vacante'
            return 'Vacante'
        
        employee = getattr(assignment, 'employee', None)
        if employee:
            nombres = getattr(employee, 'nombres', '')
            apellidos = getattr(employee, 'apellidos', '')
            nombre = f"{nombres} {apellidos}".strip()
            return nombre if nombre else 'Vacante'
        return 'Vacante'
    
    def _get_cargo(self, assignment):
        """Extrae la denominación del cargo."""
        if isinstance(assignment, dict):
            cargo = assignment.get('denominacioncargoid', {})
            if isinstance(cargo, dict):
                return cargo.get('cargo', 'N/A')
            return str(cargo) if cargo else 'N/A'
        
        cargo_obj = getattr(assignment, 'denominacioncargoid', None)
        if cargo_obj:
            return getattr(cargo_obj, 'cargo', 'N/A')
        return 'N/A'
    
    def _get_cargo_especifico(self, assignment):
        """Extrae la denominación del cargo específico."""
        if isinstance(assignment, dict):
            cargo = assignment.get('denominacioncargoespecificoid', {})
            if isinstance(cargo, dict):
                return cargo.get('cargo', 'N/A')
            return str(cargo) if cargo else 'N/A'
        
        cargo_obj = getattr(assignment, 'denominacioncargoespecificoid', None)
        if cargo_obj:
            return getattr(cargo_obj, 'cargo', 'N/A')
        return 'N/A'
    
    def _get_grado(self, assignment):
        """Extrae el grado."""
        if isinstance(assignment, dict):
            grado = assignment.get('gradoid', {})
            if isinstance(grado, dict):
                return grado.get('grado', 'N/A')
            return str(grado) if grado else 'N/A'
        
        grado_obj = getattr(assignment, 'gradoid', None)
        if grado_obj:
            return getattr(grado_obj, 'grado', 'N/A')
        return 'N/A'
    
    def _get_tipo_nomina(self, assignment):
        """Extrae el tipo de nómina."""
        if isinstance(assignment, dict):
            nomina = assignment.get('tiponominaid', {})
            if isinstance(nomina, dict):
                return nomina.get('nomina', 'N/A')
            return str(nomina) if nomina else 'N/A'
        
        nomina_obj = getattr(assignment, 'tiponominaid', None)
        if nomina_obj:
            return getattr(nomina_obj, 'nomina', 'N/A')
        return 'N/A'
    
    def _get_direccion(self, assignment):
        """Extrae la dirección general."""
        if isinstance(assignment, dict):
            direccion = assignment.get('DireccionGeneral', {})
            if isinstance(direccion, dict):
                return direccion.get('direccion_general', 'N/A')
            return str(direccion) if direccion else 'N/A'
        
        direccion_obj = getattr(assignment, 'DireccionGeneral', None)
        if direccion_obj:
            return getattr(direccion_obj, 'direccion_general', 'N/A')
        return 'N/A'
    
    def _get_estatus(self, assignment):
        """Extrae el estatus de la asignación."""
        if isinstance(assignment, dict):
            estatus = assignment.get('estatusid', {})
            if isinstance(estatus, dict):
                return estatus.get('estatus', 'N/A')
            return str(estatus) if estatus else 'N/A'
        
        estatus_obj = getattr(assignment, 'estatusid', None)
        if estatus_obj:
            return getattr(estatus_obj, 'estatus', 'N/A')
        return 'N/A'
