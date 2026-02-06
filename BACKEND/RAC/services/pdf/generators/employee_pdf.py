"""
Generador de PDF para reportes de empleados.
Genera una tabla con información básica de empleados.
"""
from reportlab.platypus import Spacer, Paragraph, PageBreak
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm
from django.apps import apps

from RAC.services.mapa_reporte import MAPA_REPORTES
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
  
    
    # Número de empleados por página (aproximado)
    EMPLOYEES_PER_PAGE = 35
    
    def __init__(self, employees, title="Reporte de Empleados", filters=None):

 
        super().__init__(
            data=employees,
            title=title,
            orientation='landscape',  
            metadata={'filters': filters or {}}
        )
        
        self.employees = list(employees) if hasattr(employees, '__iter__') else []
        self.employees.sort(
            key=lambda e: (
                self._get_dependencia(e).lower(), 
                self._get_tipo_nomina(e).lower(),
                self._get__cargo(e).lower(),
                int(self._get_cedula(e)) if self._get_cedula(e).isdigit() else 0 
            )
        )
        self.filters = filters or {}
        self.styles = get_paragraph_styles()
    
    def _get_footer_text(self):
        total = len(self.employees)
        return f"Total de empleados: {total} | Generado: {self.generated_at.strftime('%d/%m/%Y %H:%M')}"
    
    def _generate_filename(self):
        date_str = self.generated_at.strftime('%Y%m%d_%H%M')
        return f"reporte_empleados_{date_str}.pdf"
    
    def _build_content(self):
        story = []
        width = self._get_available_width()

        story.append(Spacer(1, -5 * mm))

        story.extend(self._build_header_section())

        # Tabla de empleados
        story.extend(self._build_employees_table())

        return story
    
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

            titulo_principal = f"Listado de {filtro_aplicado_nombre}" if filtro_aplicado_nombre else "REPORTE DE TRABAJADORES"

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
    
    def _build_header_section(self):
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
    
# forma de agrupacion
    
    def _build_employees_table(self):
        elements = []

        empleados_por_dependencia = {}
        for employee in self.employees:
            dependencia = self._get_DireccionGeneral(employee)
            if dependencia not in empleados_por_dependencia:
                empleados_por_dependencia[dependencia] = []
            empleados_por_dependencia[dependencia].append(employee)

        # Ordenar las dependencias de forma alfabética
        for dependencia in sorted(empleados_por_dependencia.keys()):
            empleados = empleados_por_dependencia[dependencia]
            elements.extend(create_section_title(dependencia))

            # Definir encabezados
            headers = [
                '#',
                'Cédula',
                'Nombres',
                'Apellidos',
                'F. Ingreso',
                'Años APN',
                'Sexo',
                'Tipo de Nómina',
                'Cargo',
            ]

            # Definir anchos de columna (en mm, ajustados para landscape A4)
            col_widths = [
                12 * mm,   # #
                22 * mm,   # Cédula
                45 * mm,   # Nombres
                45 * mm,   # Apellidos
                22 * mm,   # F. Ingreso
                18 * mm,   # Años APN
                12 * mm,   # Sexo
                40 * mm,   # Tipo de Nómina
                40 * mm,   # Cargo
            ]

            # Construir filas de datos para los empleados de esta dependencia
            rows = []
            for idx, employee in enumerate(empleados, start=1):
                row = [
                    str(idx),
                    self._get_cedula(employee),
                    self._get_nombres(employee),
                    self._get_apellidos(employee),
                    self._get_fecha_ingreso(employee),
                    self._get_anos_apn(employee),
                    self._get_sexo(employee),
                    self._get_tipo_nomina(employee),
                    self._get__cargo(employee)
                    
                ]
                rows.append(row)

            # Crear tabla para esta dependencia
            table = create_data_table(headers, rows, col_widths, with_alternating_rows=True)
            elements.append(table)

        return elements
    
    # =========================================================================
    # Métodos auxiliares para extraer datos del empleado
    # =========================================================================
    
    def _get_cedula(self, employee):
        if isinstance(employee, dict):
            return str(employee.get('cedulaidentidad', 'N/A'))
        return str(getattr(employee, 'cedulaidentidad', 'N/A'))
    
    def _get_nombres(self, employee):
        if isinstance(employee, dict):
            return employee.get('nombres', 'N/A')
        return getattr(employee, 'nombres', 'N/A')
    
    def _get_apellidos(self, employee):
        if isinstance(employee, dict):
            return employee.get('apellidos', 'N/A')
        return getattr(employee, 'apellidos', 'N/A')
    
    def _get_fecha_nacimiento(self, employee):
        if isinstance(employee, dict):
            fecha = employee.get('fecha_nacimiento')
        else:
            fecha = getattr(employee, 'fecha_nacimiento', None)
        return format_date(fecha)
    
    def _get_fecha_ingreso(self, employee):
        if isinstance(employee, dict):
            fecha = employee.get('fechaingresoorganismo')
        else:
            fecha = getattr(employee, 'fechaingresoorganismo', None)
        return format_date(fecha)
    
    
    # con decimales 
    # def _get_anos_apn(self, employee):
    #     """Extrae los años en APN."""
    #     if isinstance(employee, dict):
    #         anos = employee.get('total_anos_apn', employee.get('anos_apn', 'N/A'))
    #     else:
    #         anos = getattr(employee, 'total_anos_apn', 'N/A')
    #     return str(anos) if anos is not None else 'N/A'
    
    # sin decimales 
    def _get_anos_apn(self, employee):
        if isinstance(employee, dict):
            anos = employee.get('total_anos_apn', employee.get('anos_apn', 'N/A'))
        else:
            anos = getattr(employee, 'total_anos_apn', 'N/A') 
    
        if anos is not None and anos != 'N/A':
            try:
                return str(int(anos))  
            except (ValueError, TypeError):
                return str(anos)
                
        return 'N/A'
    
    # def _get_n_contrato(self, employee):
    #     """Extrae el número de contrato."""
    #     if isinstance(employee, dict):
    #         return str(employee.get('n_contrato', 'N/A') or 'N/A')
    #     contrato = getattr(employee, 'n_contrato', None)
    #     return str(contrato) if contrato else 'N/A'
    
      
    def _get_sexo(self, employee):
        sexo_texto = 'N/A'
        
        if isinstance(employee, dict):
            sexo = employee.get('sexo', {})
            if isinstance(sexo, dict):
                sexo_texto = sexo.get('sexo', 'N/A')
            else:
                sexo_texto = str(sexo) if sexo else 'N/A'
        else:
            # Si es un objeto modelo
            sexo_obj = getattr(employee, 'sexoid', None)
            if sexo_obj:
                sexo_texto = getattr(sexo_obj, 'sexo', 'N/A')

        # Lógica de abreviación
        sexo_upper = str(sexo_texto).upper()
        if 'MASCULINO' in sexo_upper:
            return 'M'
        elif 'FEMENINO' in sexo_upper:
            return 'F'
            
        return sexo_texto
    
    def _get_tipo_nomina(self, employee):
        try:
            if hasattr(employee, 'assignments'):
                assignment = employee.assignments.first()
                
                if assignment and assignment.tiponominaid:
                    return assignment.tiponominaid.nomina
        except Exception:
            pass
            
        return "N/A"
    
    def _get_dependencia(self, employee):
 
        try:
            if hasattr(employee, 'assignments'):
                assignment = employee.assignments.first()
                
                if assignment and assignment.DireccionGeneral:
                    dg = assignment.DireccionGeneral
                    
                    if dg.dependenciaId:
                        return dg.dependenciaId.dependencia
        except Exception:
            pass
            
        return "N/A"
    
    def _get__cargo(self, employee):
        try:
            if hasattr(employee,'assignments'):
                assignment = employee.assignments.first()
                
                if assignment and assignment.denominacioncargoid:
                    return assignment.denominacioncargoid.cargo
        except Exception:
            pass
            
        return "N/A"
    
    def _get_DireccionGeneral(self, employee):
        try:
            
            if hasattr(employee, 'assignments'):
                assignment = employee.assignments.first()
                
                if assignment and assignment.DireccionGeneral:
                    return assignment.DireccionGeneral.direccion_general
        except Exception:
            pass
        
        return "N/A"
    
    def _get_nomina_nombre(self, nomina_id):
        """Obtiene el nombre de la nómina basado en el ID."""
        try:
            # Simulación de consulta para obtener el nombre de la nómina
            Nomina = apps.get_model('RAC', 'Tiponomina')
            nomina = Nomina.objects.get(id=nomina_id)
            return nomina.nomina
        except Exception:
            return "N/A"





