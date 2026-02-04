from django.db.models import Count, Q
from reportlab.platypus import Spacer, Paragraph
from reportlab.lib.units import mm

from ..base_generator import BasePDFGenerator
from ..templates.styles import get_paragraph_styles
from ..templates.components import (
    create_section_title, 
    create_data_table,
    create_stats_box
)

class AssignmentPDFGenerator(BasePDFGenerator):
    """
    Generador de PDF para reportes de asignaciones/códigos.
    Optimizado para manejar alto volumen de datos mediante iteradores.
    """
    
    def __init__(self, assignments, title="Reporte de Cargos", filters=None):
        """
        Inicializa el generador. 
        Mantenemos el QuerySet como 'self.assignments' para los métodos internos.
        """
        super().__init__(
            data=assignments,
            title=title,
            orientation='landscape',
            metadata={'filters': filters or {}}
        )
        # Guardamos el QuerySet sin evaluarlo (sin list())
        self.assignments = assignments 
        self.filters = filters or {}
        self.styles = get_paragraph_styles()

    def _get_footer_text(self):
        """Retorna el texto para el footer usando count() de la DB."""
        total = self.assignments.count()
        return f"Total de Cargos: {total} | Generado: {self.generated_at.strftime('%d/%m/%Y %H:%M')}"

    def _build_content(self):
        """
        IMPLEMENTACIÓN OBLIGATORIA: Construye el contenido del PDF.
        """
        story = []
        
        # 1. Agregar estadísticas (Header Section)
        story.extend(self._build_header_section())
        
        # 2. Agregar tabla de asignaciones (Table Section)
        story.extend(self._build_assignments_table())
        
        return story

    def _build_header_section(self):
        """Construye las estadísticas usando agregación de base de datos."""
        elements = []
        elements.append(Spacer(1, 10))

        # Realizamos los cálculos directamente en la base de datos
        stats_data = self.assignments.aggregate(
            total=Count('id'),
            ocupados=Count('id', filter=Q(estatusid__estatus__iexact='ACTIVO')),
            vacantes=Count('id', filter=Q(estatusid__estatus__iexact='VACANTE'))
        )

        stats = {
            'Total Cargos': stats_data['total'],
            'Ocupados': stats_data['ocupados'],
            'Vacantes': stats_data['vacantes'],
        }

        width = self._get_available_width()
        elements.append(create_stats_box(stats, width))
        elements.append(Spacer(1, 15))
        
        return elements

    def _build_assignments_table(self):
        """Construye la tabla procesando registros con .iterator()."""
        elements = []
        elements.extend(create_section_title("Listado de Cargos"))

        headers = [
            '#', 'Código', 'Cédula', 'Empleado', 'Cargo', 
            'Cargo Esp.', 'Grado', 'Nómina', 'Dirección', 'Estatus'
        ]
        
        col_widths = [
            10*mm, 25*mm, 22*mm, 40*mm, 35*mm, 
            35*mm, 15*mm, 25*mm, 30*mm, 18*mm
        ]

        rows = []
        # .iterator() permite que los 2000+ registros no saturen la RAM
        for idx, assignment in enumerate(self.assignments.iterator(), start=1):
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

        if not rows:
            elements.append(Paragraph("No se encontraron registros.", self.styles['Body']))
        else:
            table = create_data_table(headers, rows, col_widths, with_alternating_rows=True)
            elements.append(table)

        return elements

    # =========================================================================
    # Métodos auxiliares corregidos
    # =========================================================================
    
    def _get_codigo(self, assignment):
        return str(getattr(assignment, 'codigo', 'N/A'))
    
    def _get_cedula_empleado(self, assignment):
        employee = getattr(assignment, 'employee', None)
        return str(getattr(employee, 'cedulaidentidad', 'Vacante')) if employee else 'Vacante'
    
    def _get_nombre_empleado(self, assignment):
        employee = getattr(assignment, 'employee', None)
        if employee:
            nombres = getattr(employee, 'nombres', '')
            apellidos = getattr(employee, 'apellidos', '')
            return f"{nombres} {apellidos}".strip() or 'N/A'
        return 'Vacante'
    
    def _get_cargo(self, assignment):
        cargo_obj = getattr(assignment, 'denominacioncargoid', None)
        return getattr(cargo_obj, 'cargo', 'N/A') if cargo_obj else 'N/A'
    
    def _get_cargo_especifico(self, assignment):
        cargo_obj = getattr(assignment, 'denominacioncargoespecificoid', None)
        return getattr(cargo_obj, 'cargo', 'N/A') if cargo_obj else 'N/A'
    
    def _get_grado(self, assignment):
        grado_obj = getattr(assignment, 'gradoid', None)
        return getattr(grado_obj, 'grado', 'N/A') if grado_obj else 'N/A'
    
    def _get_tipo_nomina(self, assignment):
        nomina_obj = getattr(assignment, 'tiponominaid', None)
        return getattr(nomina_obj, 'nomina', 'N/A') if nomina_obj else 'N/A'
    
    def _get_direccion(self, assignment):
        direccion_obj = getattr(assignment, 'DireccionGeneral', None)
        return getattr(direccion_obj, 'direccion_general', 'N/A') if direccion_obj else 'N/A'
    
    def _get_estatus(self, assignment):
        estatus_obj = getattr(assignment, 'estatusid', None)
        return getattr(estatus_obj, 'estatus', 'N/A') if estatus_obj else 'N/A'