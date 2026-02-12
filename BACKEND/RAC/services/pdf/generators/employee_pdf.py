"""
Generador de PDF para reportes de empleados.
Genera una tabla organizada por Dependencia y Dirección General.
Evita títulos huérfanos mediante el uso de KeepTogether.
        from reportlab.platypus import KeepTogether, Paragraph, Spacer
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
        # story.append(Spacer(1, -5 * mm))
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

        # 1. Agrupación (4 Niveles)
        agrupacion = {} 
        for employee in self.employees:
            assignments = getattr(employee, 'filtered_assignments', [])
            if not assignments:
                self._registrar_en_agrupacion(agrupacion, "S/D", "S/D", "S/D", "S/D", employee)
                continue
            asig = assignments[0]
            dep = getattr(asig, 'Dependencia', None) or "DEPENDENCIA DESCONOCIDA"
            dg = getattr(asig, 'DireccionGeneral', None) or "ASIGNACIÓN DIRECTA"
            dl = getattr(asig, 'DireccionLinea', None) or "ASIGNACIÓN DIRECTA"
            coord = getattr(asig, 'Coordinacion', None) or "ASIGNACIÓN DIRECTA"
            self._registrar_en_agrupacion(agrupacion, dep, dg, dl, coord, employee)

        # 2. PROCESO DE RENDERIZADO CON CONTROL DE REPETICIÓN E INTELIGENCIA DE TÍTULOS
        last_dep, last_dg, last_dl = None, None, None
        
        # Lista extendida de frases para ignorar títulos redundantes
        ignorar = [
            "ASIGNACIÓN DIRECTA", 
            "ASIGNACIÓN DIRECTA A LA DEPENDENCIA", 
            "ASIGNACIÓN DIRECTA A LA DIRECCION GENERAL", 
            "ASIGNACIÓN DIRECTA A LA DIRECCION LINEA",
            "NONE", "N/A", "SIN DIRECCIÓN ASIGNADA"
        ]

        sorted_deps = sorted(agrupacion.keys(), key=lambda d: getattr(d, 'id', 999) if hasattr(d, 'id') else 999)

        for dep in sorted_deps:
            dep_nom = getattr(dep, 'dependencia', str(dep))
            dgs = agrupacion[dep]
            sorted_dgs = sorted(dgs.keys(), key=lambda g: getattr(g, 'orden_by_direccion', 999) if hasattr(g, 'orden_by_direccion') else 999)

            for dg in sorted_dgs:
                dg_nom = getattr(dg, 'direccion_general', str(dg))
                dls = dgs[dg]
                sorted_dls = sorted(dls.keys(), key=lambda l: getattr(l, 'orden_by_direccion', 999) if hasattr(l, 'orden_by_direccion') else 999)

                for dl in sorted_dls:
                    dl_nom = getattr(dl, 'direccion_linea', str(dl))
                    coords = dls[dl]
                    sorted_coords = sorted(coords.keys(), key=lambda c: getattr(c, 'orden_by_coordinacion', 999) if hasattr(c, 'orden_by_coordinacion') else 999)

                    for coord in sorted_coords:
                        coord_nom = getattr(coord, 'coordinacion', str(coord))
                        
                        # --- LÓGICA DE TÍTULOS INTELIGENTES ---
                        titulos_bloque = []
                        
                        # 1. DEPENDENCIA (Solo si cambia)
                        if dep_nom != last_dep:
                            titulos_bloque.extend(create_section_title(f"DEPENDENCIA: {dep_nom.upper()}"))
                            last_dep, last_dg, last_dl = dep_nom, None, None
                        
                        # 2. DIRECCIÓN GENERAL (Solo si cambia y no es redundante)
                        if dg_nom != last_dg and dg_nom.upper() not in ignorar:
                            titulos_bloque.extend(create_section_title(f"  > DG: {dg_nom}"))
                            last_dg, last_dl = dg_nom, None
                        
                        # 3. DIRECCIÓN DE LÍNEA (Solo si cambia y no es redundante)
                        if dl_nom != last_dl and dl_nom.upper() not in ignorar:
                            titulos_bloque.extend(create_section_title(f"    - DL / COORD: {dl_nom}"))
                            last_dl = dl_nom
                        
                        # 4. COORDINACIÓN (Solo si no es redundante)
                        if coord_nom.upper() not in ignorar:
                            titulos_bloque.extend(create_section_title(f"      * COORD: {coord_nom}"))

                        # Datos de la tabla
                        headers = ['#', 'Cédula', 'Nombres', 'Apellidos', 'F. Ingreso', 'Años APN', 'Sexo', 'Tipo de Nómina', 'Cargo']
                        col_widths = [10*mm, 22*mm, 40*mm, 40*mm, 22*mm, 20*mm, 15*mm, 35*mm, 53*mm]
                        
                        def sort_cedula_desc(e):
                            c = self._get_cedula(e)
                            try: return -int(c)
                            except: return 0

                        empleados = sorted(coords[coord], key=lambda e: (self._get_orden_cargo(e), sort_cedula_desc(e)))
                        rows = [[str(idx), self._get_cedula(e), self._get_nombres(e), self._get_apellidos(e), 
                                 self._get_fecha_ingreso(e), self._get_anos_apn(e), self._get_sexo(e), 
                                 self._get_tipo_nomina(e), self._get__cargo(e)] 
                                for idx, e in enumerate(empleados, start=1)]

                        if rows:
                            # Unión de títulos para evitar huerfanos
                            if titulos_bloque:
                                for p in titulos_bloque:
                                    if isinstance(p, Paragraph): p.keepWithNext = True
                                elements.append(KeepTogether(titulos_bloque))
                                elements.append(Spacer(1, 2*mm))

                            # Una sola tabla para flujo libre y evitar encabezados duplicados
                            tabla_completa = create_data_table(headers, rows, col_widths, with_alternating_rows=True)
                            elements.append(tabla_completa)
                            elements.append(Spacer(1, 6 * mm))

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
        
        
        
    def _get_orden_cargo(self, employee):
        filtered = getattr(employee, 'filtered_assignments', [])
        if filtered and filtered[0].denominacioncargoid:
            return getattr(filtered[0].denominacioncargoid, 'orden_by_cargo', 999)
        return 999
    
    
    def _registrar_en_agrupacion(self, dic, dep, dg, dl, coord, emp):
        if dep not in dic: dic[dep] = {}
        if dg not in dic[dep]: dic[dep][dg] = {}
        if dl not in dic[dep][dg]: dic[dep][dg][dl] = {}
        if coord not in dic[dep][dg][dl]: dic[dep][dg][dl][coord] = []
        dic[dep][dg][dl][coord].append(emp)