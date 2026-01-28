import { Code, Status } from "@/app/types/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Definición de estilos ULTRA COMPACTOS para máximo contenido
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 6.5, // Un poco más pequeño
    paddingTop: 22, // Reducido para más espacio
    paddingBottom: 32, // Reducido para más espacio
    paddingHorizontal: 18, // Reducido para más espacio
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 6, // Más cerca del borde
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
  footerBannerContainer: {
    width: "100%",
    height: 45, // Más delgado
  },
  footerImage: {
    width: "100%",
    height: "100%",
  },
  footerText: {
    fontSize: 5.5, // Más pequeño
    color: "#666",
    marginTop: 1,
    textAlign: "center",
    paddingHorizontal: 18,
    backgroundColor: "white",
    paddingVertical: 1,
  },
  logo: {
    width: 60, // Más pequeño
    height: 24,
  },
  title: {
    fontSize: 9, // Más pequeño
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a237e",
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 6.5, // Más pequeño
    fontWeight: "bold",
    marginBottom: 3,
    color: "#3949ab",
    textAlign: "center",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 4,
    padding: 3,
    border: "0.2pt solid #e0e0e0", // Más delgado
    borderRadius: 1,
    backgroundColor: "#fff",
  },
  infoCard: {
    marginBottom: 4,
    padding: 3,
    backgroundColor: "#f8f9fa",
    borderLeft: "1.5pt solid #1a237e", // Más delgado
    borderRadius: 1,
  },
  infoTitle: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 1,
    color: "#1a237e",
  },
  infoText: {
    fontSize: 5.5,
    color: "#555",
    marginBottom: 0.5,
  },
  table: {
    marginTop: 3,
    border: "0.2pt solid #e0e0e0", // Más delgado
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a237e",
    borderBottom: "0.2pt solid #e0e0e0", // Más delgado
    paddingVertical: 2, // Reducido
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.2pt solid #e0e0e0", // Más delgado
    paddingVertical: 1.5, // Reducido
  },
  tableCell: {
    paddingHorizontal: 2.5, // Reducido
    fontSize: 5, // Más pequeño
  },
  headerCell: {
    fontWeight: "bold",
    color: "white",
    fontSize: 5.5, // Más pequeño
  },
  pageNumber: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 5.5,
    color: "#666",
  },
  // Estilos ULTRA COMPACTOS para el detalle del código - 12 por página
  codeCard: {
    marginBottom: 3,
    padding: 2.5,
    border: "0.2pt solid #e0e0e0", // Más delgado
    borderRadius: 1,
    backgroundColor: "#fff",
    breakInside: "avoid",
    minHeight: 70, // Mucho más bajo para 12 por página
    width: "24%", // 4 columnas (24% cada una)
  },
  codeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
    paddingBottom: 0.5,
    borderBottom: "0.2pt solid #f0f0f0", // Más delgado
  },
  codeTitle: {
    fontSize: 6, // Más pequeño
    fontWeight: "bold",
    color: "#1a237e",
  },
  codeBadge: {
    paddingHorizontal: 2,
    paddingVertical: 0.3,
    borderRadius: 3,
    fontSize: 4.5,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    marginBottom: 0.5,
    minHeight: 7,
  },
  label: {
    fontWeight: "bold",
    width: "35%",
    color: "#333",
    fontSize: 5,
  },
  value: {
    width: "65%",
    color: "#555",
    fontSize: 5,
  },
  sectionTitle: {
    fontSize: 6,
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 1,
    color: "#3949ab",
    borderBottom: "0.2pt dashed #e0e0e0", // Más delgado
    paddingBottom: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 1.5,
    paddingVertical: 0.2,
    borderRadius: 2,
    fontSize: 3.5,
    fontWeight: "bold",
    marginLeft: 0.5,
  },
  emptyText: {
    fontStyle: "italic",
    color: "#999",
    fontSize: 5.5,
    textAlign: "center",
    paddingVertical: 6,
  },
  // Estilos para layout de columnas - 12 códigos por página (4×3)
  codesGrid: {
    flexDirection: "column",
    gap: 2.5,
  },
  codesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2.5,
    marginBottom: 2.5,
  },
  // Estilos para estadísticas
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    padding: 2.5,
    backgroundColor: "#e8f4fd",
    borderRadius: 1,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 5,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 0.5,
  },
  statValue: {
    fontSize: 6.5,
    color: "#333",
    fontWeight: "bold",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1.5,
    marginBottom: 3,
  },
  tag: {
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 4,
    fontSize: 5,
    fontWeight: "bold",
  },
  fullWidthTable: {
    width: "100%",
  },
  compactValue: {
    fontSize: 5,
    color: "#555",
    lineHeight: 1,
  },
});

// Función para formatear fecha
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

// Función para obtener el color del estado
const getStatusColor = (estatusText?: string): string => {
  if (!estatusText) return "#6c757d";

  const estatus = estatusText.toLowerCase();

  if (estatus.includes("activo")) return "#28a745";
  if (estatus.includes("inactivo") || estatus.includes("bloqueado"))
    return "#dc3545";
  if (estatus.includes("vacante")) return "#17a2b8";
  if (estatus.includes("suspend")) return "#ffc107";

  return "#6c757d";
};

// Función para obtener el texto del estado
const getStatusText = (status: Status): string => {
  return status?.estatus || "N/A";
};

// Función para truncar texto
const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + ".";
};

// Componente ULTRA COMPACTO para 12 por página
const CodeCard = ({ codigo, index }: { codigo: Code; index: number }) => {
  const statusText = getStatusText(codigo.estatusid);
  const statusColor = getStatusColor(statusText);

  return (
    <View style={styles.codeCard}>
      <View style={styles.codeHeader}>
        <Text style={styles.codeTitle}>{codigo.codigo || "S/C"}</Text>
        <View style={[styles.codeBadge, { backgroundColor: "#e8f4fd" }]}>
          <Text style={{ color: "#1a237e", fontSize: 4.5 }}>#{index + 1}</Text>
        </View>
      </View>

      {/* Información ULTRA compacta */}
      <Text style={styles.compactValue}>
        {codigo.denominacioncargo?.cargo
          ? truncateText(codigo.denominacioncargo.cargo, 22)
          : "N/A"}
      </Text>

      {/* Grado y nómina en línea muy compacta */}
      <Text style={[styles.compactValue, { marginTop: 0.5 }]}>
        {codigo.grado?.grado?.substring(0, 4) || "N/A"}|
        {codigo.tiponomina?.nomina?.substring(0, 6) || "N/A"}
      </Text>

      {/* Adscripción ultra condensada */}
      {codigo.OrganismoAdscrito && (
        <Text
          style={[
            styles.compactValue,
            { marginTop: 0.5, color: "#666", fontSize: 4.5 },
          ]}
        >
          {truncateText(codigo.OrganismoAdscrito.Organismoadscrito, 18)}
        </Text>
      )}

      {/* Estado y fecha en línea ultra compacta */}
      <View
        style={[
          styles.row,
          { marginTop: 0.5, justifyContent: "space-between" },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[styles.compactValue, { marginRight: 0.5 }]}>
            {truncateText(statusText, 8)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={{ color: "white", fontSize: 3.5 }}>●</Text>
          </View>
        </View>
        <Text style={[styles.compactValue, { color: "#888", fontSize: 4.5 }]}>
          {formatDate(codigo.fecha_actualizacion)}
        </Text>
      </View>
    </View>
  );
};

// Función para generar páginas de la tabla (36 registros por página)
const generarPaginasTabla = (codeList: Code[]) => {
  const registrosPorPagina = 36;
  const totalPaginas = Math.max(
    1,
    Math.ceil(codeList.length / registrosPorPagina),
  );
  const paginas = [];

  for (let pagina = 0; pagina < totalPaginas; pagina++) {
    const inicio = pagina * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const registrosEnPagina = codeList.slice(inicio, fin);

    paginas.push(
      <Page
        key={`tabla-${pagina}`}
        orientation="landscape"
        style={styles.page}
        break={pagina > 0}
      >
        {/* Header */}
        <View style={styles.header} fixed>
          <Image src="/logoOAC.png" style={styles.logo} />
          <Image src="/juntosPorVida.png" style={styles.logo} />
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerBannerContainer}>
            <Image src="/cintillo2.png" style={styles.footerImage} />
          </View>
          <Text style={styles.footerText}>
            Catálogo de Códigos - Tabla Resumen
          </Text>
        </View>

        {/* Número de página */}
        <Text style={styles.pageNumber}>
          Tabla {pagina + 1}/{totalPaginas} • {inicio + 1}-
          {Math.min(fin, codeList.length)}/{codeList.length}
        </Text>

        {/* Contenido - TABLA CON 36 REGISTROS */}
        <View>
          <Text style={styles.title}>TABLA RESUMEN DE CÓDIGOS</Text>

          {/* Tabla ULTRA COMPACTA - 36 registros */}
          <View style={[styles.table, styles.fullWidthTable]}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "3%" }]}
              >
                #
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "8%" }]}
              >
                CÓDIGO
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "27%" }]}
              >
                DENOMINACIÓN
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "6%" }]}
              >
                GRADO
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "8%" }]}
              >
                NÓMINA
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "23%" }]}
              >
                ADSCRIPCIÓN
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "12%" }]}
              >
                ESTADO
              </Text>
              <Text
                style={[styles.tableCell, styles.headerCell, { width: "13%" }]}
              >
                ACTUALIZ.
              </Text>
            </View>

            {registrosEnPagina.map((codigo, index) => (
              <View key={codigo.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "3%" }]}>
                  {inicio + index + 1}
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>
                  {codigo.codigo || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "27%" }]}>
                  {truncateText(codigo.denominacioncargo?.cargo || "-", 34)}
                </Text>
                <Text style={[styles.tableCell, { width: "6%" }]}>
                  {codigo.grado?.grado?.substring(0, 4) || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>
                  {codigo.tiponomina?.nomina?.substring(0, 8) || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "23%" }]}>
                  {truncateText(
                    codigo.OrganismoAdscrito?.Organismoadscrito ||
                      codigo.DireccionGeneral?.direccion_general ||
                      codigo.DireccionLinea?.direccion_linea ||
                      codigo.Coordinacion?.coordinacion ||
                      "-",
                    26,
                  )}
                </Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>
                  {truncateText(getStatusText(codigo.estatusid), 10)}
                </Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>
                  {formatDate(codigo.fecha_actualizacion)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>,
    );
  }

  return paginas;
};

// Función para generar páginas de detalles (12 códigos por página - 4×3)
const generarPaginasDetalles = (codeList: Code[]) => {
  const codigosPorPagina = 12; // 4 columnas × 3 filas
  const columnasPorFila = 4;
  const filasPorPagina = 3;
  const totalPaginas = Math.max(
    1,
    Math.ceil(codeList.length / codigosPorPagina),
  );
  const paginas = [];

  for (let pagina = 0; pagina < totalPaginas; pagina++) {
    const inicio = pagina * codigosPorPagina;
    const fin = inicio + codigosPorPagina;
    const codigosEnPagina = codeList.slice(inicio, fin);

    // Organizar en 3 filas de 4 códigos cada una
    const filas = [];
    for (let i = 0; i < codigosEnPagina.length; i += columnasPorFila) {
      filas.push(codigosEnPagina.slice(i, i + columnasPorFila));
    }

    // Rellenar con filas vacías si es necesario para mantener el layout 3×4
    while (filas.length < filasPorPagina) {
      filas.push([]);
    }

    paginas.push(
      <Page
        key={`detalle-${pagina}`}
        orientation="landscape"
        style={styles.page}
        break={pagina > 0}
      >
        {/* Header */}
        <View style={styles.header} fixed>
          <Image src="/juntosPorVida.png" style={styles.logo} />
          <Image src="/juntosPorVida.png" style={styles.logo} />
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerBannerContainer}>
            <Image src="/cintillo2.png" style={styles.footerImage} />
          </View>
          <Text style={styles.footerText}>
            Catálogo de Códigos - Detalles Individuales
          </Text>
        </View>

        {/* Número de página */}
        <Text style={styles.pageNumber}>
          Detalles {pagina + 1}/{totalPaginas} • {inicio + 1}-
          {Math.min(fin, codeList.length)}/{codeList.length}
        </Text>

        {/* Contenido - 12 CÓDIGOS POR PÁGINA */}
        <View>
          <Text style={styles.title}>DETALLE INDIVIDUAL DE CÓDIGOS</Text>

          {/* Grid de 4×3 (12 códigos) */}
          <View style={styles.codesGrid}>
            {filas.map((fila, rowIndex) => (
              <View key={rowIndex} style={styles.codesRow}>
                {fila.map((codigo, colIndex) => (
                  <CodeCard
                    key={codigo.id}
                    codigo={codigo}
                    index={inicio + rowIndex * columnasPorFila + colIndex}
                  />
                ))}
                {/* Rellenar espacios vacíos en la fila para mantener layout 4×3 */}
                {Array(columnasPorFila - fila.length)
                  .fill(null)
                  .map((_, colIndex) => (
                    <View
                      key={`empty-${rowIndex}-${colIndex}`}
                      style={[styles.codeCard, { opacity: 0 }]}
                    />
                  ))}
              </View>
            ))}
          </View>
        </View>
      </Page>,
    );
  }

  return paginas;
};

// Componente principal
export default function ReportCodePDF({ codeList }: { codeList: Code[] }) {
  if (!codeList || codeList.length === 0) {
    return (
      <Document>
        <Page orientation="landscape" style={styles.page}>
          <View style={styles.header} fixed>
            <Image src="/juntosPorVida.png" style={styles.logo} />
            <Image src="/juntosPorVida.png" style={styles.logo} />
          </View>

          <View style={styles.footer} fixed>
            <View style={styles.footerBannerContainer}>
              <Image src="/cintillo2.png" style={styles.footerImage} />
            </View>
            <Text style={styles.footerText}>Catálogo de Códigos de Cargo</Text>
          </View>

          <Text style={styles.title}>CATÁLOGO DE CÓDIGOS DE CARGO</Text>
          <Text style={[styles.emptyText, { marginTop: 35 }]}>
            No se encontraron códigos para generar el reporte
          </Text>
        </Page>
      </Document>
    );
  }

  const paginasTabla = generarPaginasTabla(codeList);
  const paginasDetalles = generarPaginasDetalles(codeList);

  return (
    <Document>
      {/* PÁGINAS DE TABLA RESUMEN (36 registros por página) */}
      {paginasTabla}

      {/* PÁGINAS DE DETALLES (12 códigos por página - 4×3) */}
      {paginasDetalles}
    </Document>
  );
}
