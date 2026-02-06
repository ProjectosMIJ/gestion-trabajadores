from django.db.models import Count, Q
from reportlab.platypus import Spacer, Paragraph
from reportlab.lib.units import mm
from django.apps import apps

from ..base_generator import BasePDFGenerator
from ..templates.styles import get_paragraph_styles
from ..templates.components import (
    create_section_title, 
    create_data_table,
    create_stats_box,
    create_header
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
        """Construye la tabla procesando registros agrupados y ordenados."""
        elements = []
        empleados_por_dependencia = {}

        # Agrupar empleados por dependencia y dirección general
        for assignment in self.assignments.iterator():
            dependencia = self._get_dependencia(assignment)
            direccion_general = self._get_direccion(assignment)

            if dependencia not in empleados_por_dependencia:
                empleados_por_dependencia[dependencia] = {}

            if direccion_general not in empleados_por_dependencia[dependencia]:
                empleados_por_dependencia[dependencia][direccion_general] = []

            empleados_por_dependencia[dependencia][direccion_general].append(assignment)

        # Ordenar las dependencias y direcciones generales alfabéticamente
        for dependencia in sorted(empleados_por_dependencia.keys()):
            elements.extend(create_section_title(f"Dependencia: {dependencia}"))

            for direccion_general in sorted(empleados_por_dependencia[dependencia].keys()):
                elements.extend(create_section_title(f"Dirección General: {direccion_general}"))

                headers = [
                    '#', 'Código', 'Cédula', 'Empleado', 'Cargo', 
                    'Cargo Esp.', 'Grado', 'Nómina', 'Dirección', 'Estatus'
                ]

                col_widths = [
                    10*mm, 20*mm, 22*mm, 40*mm, 35*mm, 
                    35*mm, 15*mm, 25*mm, 30*mm, 20*mm
                ]

                rows = []
                assignments_sorted = sorted(
                    empleados_por_dependencia[dependencia][direccion_general],
                    key=lambda a: (
                        self._get_codigo(a).lower(),
                        self._get_dependencia(a).lower(),
                        self._get_direccion(a).lower(),
                        
                        self._get_tipo_nomina(a).lower(),
                        self._get_cargo(a).lower(),
                        int(self._get_cedula_empleado(a)) if self._get_cedula_empleado(a).isdigit() else 0
                    )
                )

                for idx, assignment in enumerate(assignments_sorted, start=1):
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

    def _draw_header(self, canvas, doc):
        """Dibuja el header en el canvas."""
        canvas.saveState()

        if not hasattr(self, '_cached_header_elements'):
            institucion = "MINISTERIO DEL PODER POPULAR PARA RELACIONES INTERIORES, "
            institucion2 = "JUSTICIA Y PAZ"

            # Determinar el título principal basado en el filtro
            filtros = self.metadata.get('filters', {})
            filtro_aplicado_id = filtros.get('nomina_id', None)

            # Obtener el nombre del filtro basado en el ID (simulación de consulta o mapeo)
            filtro_aplicado_nombre = self._get_nomina_nombre(filtro_aplicado_id) if filtro_aplicado_id else None

            titulo_principal = f"Listado de {filtro_aplicado_nombre}" if filtro_aplicado_nombre else "REPORTE DE CARGOS"

            # Formatear el título con un diseño más limpio y presentable
            titulo_reporte = (
                f"<font size='12'><b>{institucion} <br/> {institucion2}</b></font><br/><font size='14'><b><br/>{titulo_principal}</b></font>"
            )

            self._cached_header_elements = create_header(titulo_reporte, width=doc.width)

        header_elements = self._cached_header_elements

        # Posicionamiento vertical
        y_offset = doc.pagesize[1] - self.page_config['topMargin'] + 10 * mm

        for el in header_elements:
            # wrap calcula el espacio necesario para el elemento
            w, h = el.wrap(doc.width, doc.topMargin)
            # drawOn "estampa" el elemento (tabla o spacer) en las coordenadas X, Y
            el.drawOn(canvas, doc.leftMargin, y_offset)
            y_offset -= h

        canvas.restoreState()

    def _get_nomina_nombre(self, nomina_id):
        """Obtiene el nombre de la nómina basado en el ID."""
        try:
            # Simulación de consulta para obtener el nombre de la nómina
            Nomina = apps.get_model('RAC', 'Tiponomina')
            nomina = Nomina.objects.get(id=nomina_id)
            return nomina.nomina
        except Exception:
            return "N/A"

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
    
    
    def _get_dependencia(self, assignment):
        """Obtiene la dependencia asociada a la dirección general del assignment."""
        direccion_general = getattr(assignment, 'DireccionGeneral', None)
        if direccion_general and direccion_general.dependenciaId:
            return direccion_general.dependenciaId.dependencia
        return "N/A"