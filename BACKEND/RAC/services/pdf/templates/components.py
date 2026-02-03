"""
Componentes reutilizables para la generación de PDFs.
Incluye funciones para crear headers, footers, títulos de sección y tablas.
"""
from reportlab.platypus import Paragraph, Table, TableStyle, Spacer, Image
from reportlab.lib.units import mm, cm
from reportlab.lib import colors
from django.conf import settings
import os

from .styles import (
    COLORS, FONTS, get_paragraph_styles, get_table_style
)


def get_logo_path(logo_name):
    """
    Obtiene la ruta completa de un logo.
    
    Args:
        logo_name: Nombre del archivo del logo (ej: 'logoOAC.png')
    
    Returns:
        Ruta completa al archivo del logo o None si no existe.
    """
    # Buscar primero en static
    static_path = os.path.join(settings.BASE_DIR, 'RAC', 'static', 'pdf_assets', logo_name)
    if os.path.exists(static_path):
        print(f"Logo encontrado en static: {static_path}")
        return static_path
    
    # Buscar en STATIC_ROOT si está configurado
    if hasattr(settings, 'STATIC_ROOT') and settings.STATIC_ROOT:
        static_root_path = os.path.join(settings.STATIC_ROOT, 'pdf_assets', logo_name)
        if os.path.exists(static_root_path):
            print(f"Logo encontrado en STATIC_ROOT: {static_root_path}")
            return static_root_path

    # Buscar en la carpeta templates.img
    templates_img_path = os.path.join(settings.BASE_DIR, 'RAC', 'services', 'pdf', 'templates', 'img', logo_name)
    if os.path.exists(templates_img_path):
        print(f"Logo encontrado en templates.img: {templates_img_path}")
        return templates_img_path
    
    print(f"Logo no encontrado: {logo_name}")
    return None

def create_header(title, subtitle=None, width=None):
    """
    Crea el header del documento con logos y título.
    """
    styles = get_paragraph_styles()
    elements = []
    
    # Si no se proporciona un ancho, usamos el estándar de A4 menos márgenes
    if not width:
        width = 160 * mm 

    # Intentar cargar logos mediante la función de búsqueda de rutas
    logo_left_path = get_logo_path('logoNuevo.png')
    logo_right_path = get_logo_path('juntosPorVida.png')

    header_data = []
    
    # 1. Logo izquierdo (Ajustado con mm y mask para transparencia)
    if logo_left_path:
        try:
            # mask='auto' es vital para que los logos PNG se vean bien
            logo_left = Image(logo_left_path, width=30*mm, height=15*mm, mask='auto')
            header_data.append(logo_left)
        except Exception as e:
            header_data.append('')
    else:
        header_data.append('')
    
    # 2. Título central
    title_paragraph = Paragraph(title.upper(), styles['Title'])
    header_data.append(title_paragraph)
    
    # 3. Logo derecho (Ajustado con mm y mask)
    if logo_right_path:
        try:
            logo_right = Image(logo_right_path, width=35*mm, height=15*mm, mask='auto')
            header_data.append(logo_right)
        except Exception as e:
            header_data.append('')
    else:
        header_data.append('')
    
    # Definición de anchos de columna: [Logo Izq, Título, Logo Der]
    col_widths = [40*mm, width - 80*mm, 40*mm]
    
    header_table = Table([header_data], colWidths=col_widths)
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, 0), 'LEFT'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    
    elements.append(header_table)
    
    # Subtítulo opcional
    if subtitle:
        elements.append(Spacer(1, 5))
        subtitle_paragraph = Paragraph(subtitle, styles['Subtitle'])
        elements.append(subtitle_paragraph)
    
    elements.append(Spacer(1, 10))
    
    return elements
def create_footer(doc, canvas, page_number, total_pages, footer_text=None):
    """
    Dibuja el footer en el canvas.
    
    Args:
        doc: Documento
        canvas: Canvas de ReportLab
        page_number: Número de página actual
        total_pages: Total de páginas (puede ser None)
        footer_text: Texto adicional para el footer
    """
    canvas.saveState()
    
    # Intentar cargar cintillo
    cintillo_path = get_logo_path('cintillo2.png')
    
    page_width, page_height = doc.pagesize
    
    # Dibujar cintillo si existe
    if cintillo_path:
        try:
            canvas.drawImage(
                cintillo_path,
                0,  # Posición X (inicio desde el borde izquierdo)
                0,  # Posición Y (inicio desde el borde inferior)
                width=page_width,  # Ancho igual al ancho de la página
                height=60,  # Altura fija del cintillo
                preserveAspectRatio=False,  # Desactivar la preservación de la relación de aspecto
                mask='auto'
            )
        except:
            pass
    
    # Número de página
    if total_pages:
        page_text = f"Página {page_number} de {total_pages}"
    else:
        page_text = f"Página {page_number}"
    
    canvas.setFont(FONTS['small'][0], FONTS['small'][1])
    canvas.setFillColor(COLORS['muted'])
    canvas.drawCentredString(page_width / 2, 42, page_text)
    
    # Texto adicional del footer
    if footer_text:
        canvas.setFont(FONTS['tiny'][0], FONTS['tiny'][1])
        canvas.drawCentredString(page_width / 2, 52, footer_text)
    
    canvas.restoreState()


def create_section_title(text):
    """
    Crea un título de sección estilizado.
    
    Args:
        text: Texto del título
    
    Returns:
        Lista de elementos Platypus
    """
    styles = get_paragraph_styles()
    elements = []
    
    # Línea superior
    elements.append(Spacer(1, 8))
    
    # Título con fondo
    title_data = [[Paragraph(text.upper(), styles['SectionTitle'])]]
    title_table = Table(title_data, colWidths=['100%'])
    title_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['header_bg']),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -1), 1, COLORS['primary']),
    ]))
    
    elements.append(title_table)
    elements.append(Spacer(1, 6))
    
    return elements


def create_info_row(label, value, label_width='35%', value_width='65%'):
    """
    Crea una fila de información (label: value).
    
    Args:
        label: Etiqueta
        value: Valor
        label_width: Ancho de la etiqueta
        value_width: Ancho del valor
    
    Returns:
        Tabla con la fila de información
    """
    styles = get_paragraph_styles()
    
    data = [[
        Paragraph(f"<b>{label}:</b>", styles['Body']),
        Paragraph(str(value) if value else 'N/A', styles['Body'])
    ]]
    
    table = Table(data, colWidths=[label_width, value_width])
    table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    
    return table


def create_data_table(headers, rows, col_widths=None, with_alternating_rows=True):
    """
    Crea una tabla de datos con encabezados.
    
    Args:
        headers: Lista de encabezados
        rows: Lista de filas (cada fila es una lista de valores)
        col_widths: Anchos de columna opcionales
        with_alternating_rows: Si True, aplica colores alternados
    
    Returns:
        Tabla Platypus con estilos aplicados
    """
    styles = get_paragraph_styles()
    
    # Preparar encabezados
    header_row = [Paragraph(str(h), styles['TableHeader']) for h in headers]
    
    # Preparar filas de datos
    data_rows = []
    for row in rows:
        data_row = [Paragraph(str(cell) if cell is not None else '', styles['TableCell']) for cell in row]
        data_rows.append(data_row)
    
    # Combinar encabezado y datos
    table_data = [header_row] + data_rows
    
    # Crear tabla
    table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    # Aplicar estilo base
    style = get_table_style(with_alternating_rows)
    
    # Agregar colores alternados si está habilitado
    if with_alternating_rows and len(data_rows) > 0:
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                style.add('BACKGROUND', (0, i), (-1, i), COLORS['row_alt'])
    
    table.setStyle(style)
    
    return table


def create_stats_box(stats, width=None):
    """
    Crea una caja de estadísticas.
    
    Args:
        stats: Diccionario con estadísticas {label: value}
        width: Ancho total de la caja
    
    Returns:
        Tabla con las estadísticas
    """
    styles = get_paragraph_styles()
    
    # Crear celdas de estadísticas
    cells = []
    for label, value in stats.items():
        cell_content = f"<b>{label}</b><br/><font size='10'>{value}</font>"
        cells.append(Paragraph(cell_content, styles['CenterSmall']))
    
    if not cells:
        return Spacer(1, 0)
    
    # Calcular anchos de columna
    if width:
        col_width = width / len(cells)
        col_widths = [col_width] * len(cells)
    else:
        col_widths = None
    
    table = Table([cells], colWidths=col_widths)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e8f4fd')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, COLORS['border']),
    ]))
    
    return table


def format_date(date_value, format_str='%d/%m/%Y'):
    """
    Formatea una fecha para mostrar en el PDF.
    
    Args:
        date_value: Valor de fecha (datetime, date, o string)
        format_str: Formato de salida
    
    Returns:
        String con la fecha formateada o 'N/A'
    """
    if not date_value:
        return 'N/A'
    
    try:
        if hasattr(date_value, 'strftime'):
            return date_value.strftime(format_str)
        # Intentar parsear si es string
        from datetime import datetime
        if isinstance(date_value, str):
            # Intentar varios formatos
            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%Y-%m-%dT%H:%M:%S']:
                try:
                    return datetime.strptime(date_value[:10], fmt[:len(date_value[:10])]).strftime(format_str)
                except:
                    continue
        return str(date_value)
    except:
        return 'N/A'
