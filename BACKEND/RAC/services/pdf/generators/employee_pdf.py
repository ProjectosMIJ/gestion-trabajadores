"""
Generador de PDF para reportes de empleados.
Genera una tabla organizada por Dependencia y Dirección General.
Evita títulos huérfanos mediante el uso de KeepTogether.
"""
from reportlab.platypus import Spacer, Paragraph, PageBreak, KeepTogether
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
        
        self.employees = employees
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
        story.append(Spacer(1, -5 * mm))
        story.extend(self._build_header_section())

        # Tabla de empleados con agrupación anidada y protección de saltos de página
        story.extend(self._build_employees_table())

        return story
    
    def _draw_header(self, canvas, doc):
        """Dibuja el header en el canvas."""
        canvas.saveState()

        if not hasattr(self, '_cached_header_elements'):
            institucion = "MINISTERIO DEL PODER POPULAR PARA RELACIONES INTERIORES, "
            institucion2 = "JUSTICIA Y PAZ"

            filtros = self.metadata.get('filters', {})
            filtro_aplicado_id = filtros.get('nomina_id', None)
            filtro_aplicado_nombre = self._get_nomina_nombre(filtro_aplicado_id) if filtro_aplicado_id else None

            titulo_principal = f"Listado de {filtro_aplicado_nombre}" if filtro_aplicado_nombre else "REPORTE DE TRABAJADORES"

            titulo_reporte = (
                f"<font size='12'><b>{institucion} <br/> {institucion2}</b></font><br/><font size='14'><b><br/>{titulo_principal}</b></font>"
            )

            self._cached_header_elements = create_header(titulo_reporte, width=doc.width)

        header_elements = self._cached_header_elements
        y_offset = doc.pagesize[1] - self.page_config['topMargin'] + 10 * mm

        for el in header_elements:
            w, h = el.wrap(doc.width, doc.topMargin)
            el.drawOn(canvas, doc.leftMargin, y_offset)
            y_offset -= h

        canvas.restoreState()
    
    def _build_header_section(self):
        elements = []
        elements.append(Spacer(1, 10))
        
        total_empleados = len(self.employees)
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
    def _build_employees_table(self):
        elements = []

        # 1. Estructura de agrupación
        agrupacion = {}
        for employee in self.employees:
            dep = self._get_dependencia(employee)
            dg = self._get_DireccionGeneral(employee)
            
            if dg == "SIN DIRECCIÓN ASIGNADA":
                dg = "ASIGNACIÓN DIRECTA A LA DEPENDENCIA"

            if dep not in agrupacion:
                agrupacion[dep] = {}
            if dg not in agrupacion[dep]:
                agrupacion[dep][dg] = []
            agrupacion[dep][dg].append(employee)

        # 2. Iterar sobre Dependencias
        for dep_nombre in sorted(agrupacion.keys()):
            direcciones = agrupacion[dep_nombre]
            
            for dg_nombre in sorted(direcciones.keys()):
                # --- DATOS DE LA TABLA ---
                headers = ['#', 'Cédula', 'Nombres', 'Apellidos', 'F. Ingreso', 'Años APN', 'Sexo', 'Tipo de Nómina', 'Cargo']
                col_widths = [10*mm, 22*mm, 40*mm, 40*mm, 22*mm, 20*mm, 15*mm, 35*mm, 45*mm]
                
                rows = []
                for idx, employee in enumerate(direcciones[dg_nombre], start=1):
                    rows.append([
                        str(idx),
                        self._get_cedula(employee),
                        self._get_nombres(employee),
                        self._get_apellidos(employee),
                        self._get_fecha_ingreso(employee),
                        self._get_anos_apn(employee),
                        self._get_sexo(employee),
                        self._get_tipo_nomina(employee),
                        self._get__cargo(employee)
                    ])

                # --- LÓGICA DE PROTECCIÓN DE TÍTULOS ---
                # Creamos el bloque de títulos
                bloque_titulos = []
                bloque_titulos.extend(create_section_title(f"DEPENDENCIA: {dep_nombre.upper()}"))
                bloque_titulos.extend(create_section_title(f"    * {dg_nombre}"))

                # Siempre pasamos los headers a la función. 
                # Si la tabla tiene más de 3 filas, protegemos los títulos + las primeras 2 filas.
                if len(rows) > 3:
                    # Parte 1: Títulos + Inicio de tabla (Cabecera + 2 filas de datos)
                    cabecera_protegida = []
                    cabecera_protegida.extend(bloque_titulos)
                    
                    tabla_inicio = create_data_table(headers, rows[:2], col_widths, with_alternating_rows=True)
                    cabecera_protegida.append(tabla_inicio)
                    
                    # El KeepTogether solo envuelve los títulos y las primeras 2 filas
                    elements.append(KeepTogether(cabecera_protegida))
                    
                    # Parte 2: El resto de la tabla (con su propia cabecera para que sea legible al saltar de página)
                    # IMPORTANTE: Aquí pasamos headers de nuevo para evitar el error 'NoneType'
                    tabla_resto = create_data_table(headers, rows[2:], col_widths, with_alternating_rows=True)
                    elements.append(tabla_resto)
                else:
                    # Para tablas pequeñas, protegemos todo el bloque
                    bloque_completo = []
                    bloque_completo.extend(bloque_titulos)
                    bloque_completo.append(create_data_table(headers, rows, col_widths, with_alternating_rows=True))
                    elements.append(KeepTogether(bloque_completo))

                elements.append(Spacer(1, 8 * mm))

        return elements
    
    # =========================================================================
    # Métodos auxiliares
    # =========================================================================
    
    def _get_cedula(self, employee):
        return str(getattr(employee, 'cedulaidentidad', 'N/A'))
    
    def _get_nombres(self, employee):
        return getattr(employee, 'nombres', 'N/A')
    
    def _get_apellidos(self, employee):
        return getattr(employee, 'apellidos', 'N/A')
    
    def _get_fecha_ingreso(self, employee):
        fecha = getattr(employee, 'fechaingresoorganismo', None)
        return format_date(fecha)
    
    def _get_anos_apn(self, employee):
        anos = getattr(employee, 'total_anos_apn', 'N/A') 
        if anos is not None and anos != 'N/A':
            try:
                return str(int(anos))  
            except (ValueError, TypeError):
                return str(anos)
        return 'N/A'
    
    def _get_sexo(self, employee):
        sexo_obj = getattr(employee, 'sexoid', None)
        sexo_texto = getattr(sexo_obj, 'sexo', 'N/A') if sexo_obj else 'N/A'
        sexo_upper = str(sexo_texto).upper()
        if 'MASCULINO' in sexo_upper: return 'M'
        if 'FEMENINO' in sexo_upper: return 'F'
        return sexo_texto
    
    def _get_tipo_nomina(self, employee):
        filtered = getattr(employee, 'filtered_assignments', [])
        if filtered and filtered[0].tiponominaid:
            return filtered[0].tiponominaid.nomina
        return "N/A"

    def _get_dependencia(self, employee):
        filtered = getattr(employee, 'filtered_assignments', [])
        if filtered and filtered[0].Dependencia:
            return filtered[0].Dependencia.dependencia
        return "DEPENDENCIA DESCONOCIDA"
    
    def _get__cargo(self, employee):
        filtered = getattr(employee, 'filtered_assignments', [])
        if filtered and filtered[0].denominacioncargoid:
            return filtered[0].denominacioncargoid.cargo
        return "SIN CARGO"
    
    def _get_DireccionGeneral(self, employee):
        filtered = getattr(employee, 'filtered_assignments', [])
        if filtered and filtered[0].DireccionGeneral:
            return filtered[0].DireccionGeneral.direccion_general
        return "SIN DIRECCIÓN ASIGNADA"
    
    def _get_nomina_nombre(self, nomina_id):
        try:
            Nomina = apps.get_model('RAC', 'Tiponomina')
            return Nomina.objects.get(id=nomina_id).nomina
        except Exception:
            return None