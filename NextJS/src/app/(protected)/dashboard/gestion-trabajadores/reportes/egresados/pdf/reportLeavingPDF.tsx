import { Leaving, InfoCode } from "@/app/types/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// Tipos específicos para las props del componente CargoInfo
interface CargoInfoProps {
  cargo: InfoCode;
  index: number;
  totalCargos: number;
}

// Definición de estilos COMPACTOS
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingTop: 40,
    paddingBottom: 55,
    paddingHorizontal: 30,
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 15,
    left: 30,
    right: 30,
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
    height: 25,
    backgroundColor: "#f0f0f0",
  },
  footerImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  footerText: {
    fontSize: 7,
    color: "#666",
    marginTop: 3,
    textAlign: "center",
    paddingHorizontal: 30,
    backgroundColor: "white",
    paddingVertical: 2,
  },
  logo: {
    width: 75,
    height: 30,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a237e",
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#3949ab",
    textAlign: "center",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 10,
    padding: 8,
    border: "0.5pt solid #e0e0e0",
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1a237e",
    borderBottom: "1pt solid #1a237e",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
    minHeight: 14,
  },
  label: {
    fontWeight: "bold",
    width: "35%",
    color: "#333",
    fontSize: 8,
  },
  value: {
    width: "65%",
    color: "#555",
    fontSize: 8,
  },
  table: {
    marginTop: 8,
    border: "0.5pt solid #e0e0e0",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a237e",
    borderBottom: "0.5pt solid #e0e0e0",
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #e0e0e0",
    paddingVertical: 5,
  },
  tableCell: {
    paddingHorizontal: 6,
    fontSize: 8,
    flex: 1,
  },
  headerCell: {
    fontWeight: "bold",
    color: "white",
    fontSize: 8,
  },
  infoText: {
    fontSize: 8,
    color: "#555",
    marginBottom: 3,
  },
  infoCard: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderLeft: "3pt solid #1a237e",
    borderRadius: 2,
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1a237e",
  },
  dateBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#e8f4fd",
    borderRadius: 3,
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 8,
    color: "#333",
    fontWeight: "bold",
  },
  pageNumber: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
  },
  cargoSection: {
    marginTop: 6,
    padding: 6,
    border: "0.5pt solid #ccc",
    borderRadius: 2,
    backgroundColor: "#fafafa",
  },
  cargoTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 4,
    borderBottom: "0.5pt solid #ddd",
    paddingBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    fontSize: 7,
    fontWeight: "bold",
    marginLeft: 3,
  },
  emptyText: {
    fontStyle: "italic",
    color: "#999",
    fontSize: 8,
    textAlign: "center",
    paddingVertical: 10,
  },
  cargoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cargoCode: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#666",
  },
  pageIndicator: {
    fontSize: 8,
    color: "#666",
    fontStyle: "italic",
    marginTop: 3,
  },
  optionalField: {
    marginTop: 2,
  },
  compactRow: {
    flexDirection: "row",
    marginBottom: 2,
    minHeight: 12,
  },
  fieldGroup: {
    marginBottom: 2,
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

// Función para calcular tiempo en el organismo (versión compacta)
const calcularTiempoServicio = (
  fechaIngreso: string,
  fechaEgreso: string,
): string => {
  if (!fechaIngreso || !fechaEgreso) return "N/A";

  try {
    const ingreso = new Date(fechaIngreso);
    const egreso = new Date(fechaEgreso);

    const diffMs = egreso.getTime() - ingreso.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0 && months > 0) {
      return `${years}a ${months}m`;
    } else if (years > 0) {
      return `${years}a`;
    } else if (months > 0) {
      return `${months}m`;
    } else {
      return `${diffDays}d`;
    }
  } catch {
    return "N/A";
  }
};

// Función para obtener el color del estado
const getStatusColor = (estatusId?: number): string => {
  if (!estatusId) return "#6c757d";

  switch (estatusId) {
    case 1:
      return "#28a745";
    case 2:
      return "#dc3545";
    case 3:
      return "#ffc107";
    case 4:
      return "#17a2b8";
    default:
      return "#6c757d";
  }
};

// Componente compacto para información de cargo CON TIPOS ESPECÍFICOS
const CargoInfo = ({ cargo, index, totalCargos }: CargoInfoProps) => {
  const statusColor = getStatusColor(cargo.estatusid?.id);

  return (
    <View style={styles.cargoSection}>
      <View style={styles.cargoHeader}>
        <Text style={styles.cargoTitle}>Cargo {index + 1}</Text>
        <Text style={styles.cargoCode}>{cargo.codigo || "Sin código"}</Text>
      </View>

      <View style={styles.compactRow}>
        <Text style={styles.label}>Denominación:</Text>
        <Text style={styles.value}>
          {cargo.denominacioncargo?.cargo || "N/A"}
          {cargo.denominacioncargoespecifico?.cargo &&
            ` (${cargo.denominacioncargoespecifico.cargo})`}
        </Text>
      </View>

      <View style={styles.compactRow}>
        <Text style={styles.label}>Grado/Nómina:</Text>
        <Text style={styles.value}>
          {cargo.grado?.grado || "N/A"} / {cargo.tiponomina?.nomina || "N/A"}
        </Text>
      </View>

      {/* Información de adscripción en grupos compactos */}
      {(cargo.OrganismoAdscrito ||
        cargo.DireccionGeneral ||
        cargo.DireccionLinea ||
        cargo.Coordinacion) && (
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { fontSize: 7 }]}>Adscripción:</Text>
          <Text style={[styles.value, { fontSize: 7 }]}>
            {[
              cargo.OrganismoAdscrito?.Organismoadscrito,
              cargo.DireccionGeneral?.direccion_general,
              cargo.DireccionLinea?.direccion_linea,
              cargo.Coordinacion?.coordinacion,
            ]
              .filter(Boolean)
              .join(" - ")}
          </Text>
        </View>
      )}

      <View style={styles.compactRow}>
        <Text style={styles.label}>Estado:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.value}>{cargo.estatusid?.estatus || "N/A"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={{ color: "white" }}>●</Text>
          </View>
        </View>
      </View>

      <View style={styles.compactRow}>
        <Text style={styles.label}>Actualización:</Text>
        <Text style={styles.value}>
          {formatDate(cargo.fecha_actualizacion)}
        </Text>
      </View>

      {cargo.observaciones && (
        <View style={[styles.compactRow, { marginTop: 2 }]}>
          <Text style={[styles.label, { color: "#666" }]}>Obs:</Text>
          <Text style={[styles.value, { fontStyle: "italic", fontSize: 7 }]}>
            {cargo.observaciones.length > 50
              ? `${cargo.observaciones.substring(0, 50)}...`
              : cargo.observaciones}
          </Text>
        </View>
      )}
    </View>
  );
};

// Componente compacto para información personal del empleado
const InformacionPersonal = ({ empleado }: { empleado: Leaving }) => {
  const tiempoServicio = calcularTiempoServicio(
    empleado.fechaingresoorganismo,
    empleado.fecha_egreso,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>

      <View style={styles.compactRow}>
        <Text style={styles.label}>Cédula:</Text>
        <Text style={[styles.value, { fontWeight: "bold" }]}>
          {empleado.cedula || "N/A"}
        </Text>
      </View>

      <View style={styles.compactRow}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={[styles.value, { fontWeight: "bold" }]}>
          {`${empleado.nombres || ""} ${empleado.apellidos || ""}`.trim() ||
            "N/A"}
        </Text>
      </View>

      <View style={styles.compactRow}>
        <Text style={styles.label}>Movimiento:</Text>
        <Text style={[styles.value, { color: "#dc3545", fontWeight: "bold" }]}>
          {empleado.Tipo_movimiento?.movimiento || "N/A"}
        </Text>
      </View>

      <View style={styles.dateBox}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>INGRESO</Text>
          <Text style={styles.dateValue}>
            {formatDate(empleado.fechaingresoorganismo)}
          </Text>
        </View>

        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>EGRESO</Text>
          <Text style={[styles.dateValue, { color: "#dc3545" }]}>
            {formatDate(empleado.fecha_egreso)}
          </Text>
        </View>

        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>TIEMPO</Text>
          <Text style={[styles.dateValue, { color: "#1a237e" }]}>
            {tiempoServicio}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Componente principal optimizado
export function ReportLeavingPDF({
  leaving,
  id,
}: {
  leaving: Leaving[];
  id: string;
}) {
  const totalEgresos = leaving.length;

  // Función para generar páginas de un empleado (ahora con 3 cargos por página)
  const generarPaginasEmpleado = (empleado: Leaving, empleadoIndex: number) => {
    const cargos = empleado.cargos || [];
    const totalCargos = cargos.length;
    const paginas = [];

    // Aumentado a 3 cargos por página para mejor aprovechamiento
    const cargosPorPagina = 3;
    const totalPaginas = Math.max(1, Math.ceil(totalCargos / cargosPorPagina));

    for (let paginaIndex = 0; paginaIndex < totalPaginas; paginaIndex++) {
      const inicio = paginaIndex * cargosPorPagina;
      const fin = inicio + cargosPorPagina;
      const cargosEnPagina = cargos.slice(inicio, fin);
      const esPrimeraPagina = paginaIndex === 0;

      paginas.push(
        <Page
          key={`empleado-${empleado.id}-pagina-${paginaIndex}`}
          size="A4"
          style={styles.page}
          break={empleadoIndex > 0 || paginaIndex > 0}
        >
          {/* Header */}
          <View style={styles.header} fixed>
            <Image src="/juntosPorVida.png" style={styles.logo} />
            <Image src="/juntosPorVida.png" style={styles.logo} />
          </View>

          {/* Footer con banner */}
          <View style={styles.footer} fixed>
            <View style={styles.footerBannerContainer}>
              <Image src="/cintillo2.png" style={styles.footerImage} />
            </View>
            <Text style={styles.footerText}>
              {esPrimeraPagina
                ? `Detalle de Egreso - ${empleado.nombres} ${empleado.apellidos}`
                : `Cont. Cargos - ${empleado.nombres} ${empleado.apellidos}`}
            </Text>
          </View>

          {/* Número de página */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Pág. ${pageNumber}/${totalPages} - Emp. ${empleadoIndex + 1}/${totalEgresos}`
            }
            fixed
          />

          {/* Contenido de la página */}
          <View>
            {esPrimeraPagina ? (
              <>
                <Text style={styles.title}>DETALLE DE EGRESO</Text>
                <InformacionPersonal empleado={empleado} />
                <Text style={styles.sectionTitle}>CARGOS ({totalCargos})</Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>CONTINUACIÓN</Text>
                <View
                  style={[
                    styles.section,
                    {
                      padding: 6,
                      marginBottom: 8,
                      backgroundColor: "#f0f8ff",
                    },
                  ]}
                >
                  <View style={styles.compactRow}>
                    <Text style={[styles.label, { width: "25%" }]}>
                      Empleado:
                    </Text>
                    <Text
                      style={[
                        styles.value,
                        { width: "75%", fontWeight: "bold" },
                      ]}
                    >
                      {empleado.nombres} {empleado.apellidos}
                    </Text>
                  </View>
                  <View style={styles.compactRow}>
                    <Text style={[styles.label, { width: "25%" }]}>
                      Cargos:
                    </Text>
                    <Text style={[styles.value, { width: "75%" }]}>
                      {inicio + 1}-{Math.min(fin, totalCargos)} de {totalCargos}
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionTitle}>CARGOS (CONT.)</Text>
              </>
            )}

            {/* Mostrar indicador de página si hay múltiples páginas */}
            {totalPaginas > 1 && (
              <Text style={styles.pageIndicator}>
                Página {paginaIndex + 1}/{totalPaginas} - Cargos {inicio + 1} a{" "}
                {Math.min(fin, totalCargos)}
              </Text>
            )}

            {/* Mostrar cargos de esta página */}
            {cargosEnPagina.length > 0 ? (
              <View style={{ gap: 6 }}>
                {cargosEnPagina.map((cargo, cargoIndex) => (
                  <CargoInfo
                    key={cargo.id}
                    cargo={cargo}
                    index={inicio + cargoIndex}
                    totalCargos={totalCargos}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Sin cargos registrados</Text>
            )}

            {/* Resumen compacto en última página */}
            {paginaIndex === totalPaginas - 1 && totalCargos > 0 && (
              <View
                style={[
                  styles.section,
                  {
                    marginTop: 10,
                    padding: 6,
                    backgroundColor: "#f8f9fa",
                  },
                ]}
              >
                <Text style={[styles.sectionTitle, { fontSize: 9 }]}>
                  RESUMEN
                </Text>

                <View style={styles.compactRow}>
                  <Text style={styles.label}>Total cargos:</Text>
                  <Text style={[styles.value, { fontWeight: "bold" }]}>
                    {totalCargos}
                  </Text>
                </View>

                {(() => {
                  const estados = cargos
                    .map((c) => c.estatusid?.estatus)
                    .filter(Boolean);
                  if (estados.length > 0) {
                    const frecuencias: Record<string, number> = {};
                    estados.forEach((estado) => {
                      frecuencias[estado] = (frecuencias[estado] || 0) + 1;
                    });
                    const masComun = Object.keys(frecuencias).reduce((a, b) =>
                      frecuencias[a] > frecuencias[b] ? a : b,
                    );

                    return (
                      <View style={styles.compactRow}>
                        <Text style={styles.label}>Estado principal:</Text>
                        <Text style={styles.value}>
                          {masComun} ({frecuencias[masComun]}/{totalCargos})
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
          </View>
        </Page>,
      );
    }

    return paginas;
  };

  return (
    <Document>
      {/* Página de resumen general */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Image src="/juntosPorVida.png" style={styles.logo} />
          <Image src="/juntosPorVida.png" style={styles.logo} />
        </View>

        {/* Footer con banner */}
        <View style={styles.footer} fixed>
          <View style={styles.footerBannerContainer}>
            <Image src="/cintillo2.png" style={styles.footerImage} />
          </View>
          <Text style={styles.footerText}>
            Reporte de Egreso de Personal - Documento confidencial
          </Text>
        </View>

        {/* Número de página */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />

        {/* Contenido principal */}
        <View>
          <Text style={styles.title}>REPORTE DE EGRESOS</Text>
          <Text style={styles.subtitle}>Total: {totalEgresos} empleados</Text>

          {/* Información general compacta */}
          <View style={[styles.section, { backgroundColor: "#f8f9fa" }]}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL REPORTE</Text>

            <Text style={styles.infoText}>
              • Generado:{" "}
              {new Date().toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.infoText}>• ID: {id}</Text>
            <Text style={styles.infoText}>• Registros: {totalEgresos}</Text>
          </View>

          {/* Tabla resumen compacta */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RESUMEN DE EGRESOS</Text>

            {leaving.length > 0 ? (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 0.6 }]}
                  >
                    #
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}
                  >
                    Cédula
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 2.5 }]}
                  >
                    Nombre
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 1.3 }]}
                  >
                    Movimiento
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 1.3 }]}
                  >
                    Egreso
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 0.8 }]}
                  >
                    Cargos
                  </Text>
                  <Text
                    style={[styles.tableCell, styles.headerCell, { flex: 0.8 }]}
                  >
                    Págs.
                  </Text>
                </View>

                {leaving.map((empleado, index) => {
                  const totalCargos = empleado.cargos?.length || 0;
                  const paginasNecesarias = Math.max(
                    1,
                    Math.ceil(totalCargos / 3),
                  );

                  return (
                    <View key={empleado.id} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 0.6 }]}>
                        {index + 1}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.5 }]}>
                        {empleado.cedula || "-"}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 2.5 }]}>
                        {`${empleado.nombres?.split(" ")[0] || ""} ${empleado.apellidos?.split(" ")[0] || ""}`.trim() ||
                          "-"}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.3 }]}>
                        {empleado.Tipo_movimiento?.movimiento?.substring(
                          0,
                          10,
                        ) || "-"}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1.3 }]}>
                        {empleado.fecha_egreso
                          ? new Date(empleado.fecha_egreso).toLocaleDateString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "2-digit",
                              },
                            )
                          : "-"}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 0.8, textAlign: "center" },
                        ]}
                      >
                        {totalCargos}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { flex: 0.8, textAlign: "center" },
                        ]}
                      >
                        {paginasNecesarias}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyText}>Sin registros de egresos</Text>
            )}
          </View>

          {/* Estadísticas compactas */}
          {leaving.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ESTADÍSTICAS</Text>

              <View style={styles.row}>
                <Text style={styles.label}>Empleados:</Text>
                <Text style={[styles.value, { fontWeight: "bold" }]}>
                  {totalEgresos}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Cargos totales:</Text>
                <Text style={styles.value}>
                  {leaving.reduce(
                    (total, emp) => total + (emp.cargos?.length || 0),
                    0,
                  )}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Páginas totales:</Text>
                <Text style={styles.value}>
                  {leaving.reduce((total, emp) => {
                    const cargos = emp.cargos?.length || 0;
                    return total + Math.max(1, Math.ceil(cargos / 3));
                  }, 1)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Page>

      {/* Generar páginas detalladas para cada empleado */}
      {leaving.flatMap((empleado, empleadoIndex) =>
        generarPaginasEmpleado(empleado, empleadoIndex),
      )}
    </Document>
  );
}
