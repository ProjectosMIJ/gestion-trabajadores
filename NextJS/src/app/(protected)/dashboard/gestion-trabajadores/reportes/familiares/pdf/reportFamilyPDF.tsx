import { Family } from "@/app/types/types";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import cintillo from "$/cintillo.jpg";
import juntosPorVida from "$/juntosPorVida.png";
import logoOAC from "$/logoOAC.png";
// Tipos para las listas
interface DiscapacidadItem {
  discapacidad: string;
  categoria?: {
    nombre_categoria: string;
  };
}

interface PatologiaItem {
  patologia: string;
  categoria?: {
    nombre_categoria: string;
  };
}

type ListaItem = DiscapacidadItem | PatologiaItem;

// Definición de estilos optimizados para aprovechar espacio
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 30,
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 10,
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
    height: 60, // Aumentado de 30 a 40
  },
  footerImage: {
    width: "100%",
    height: "100%",
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
    width: 80,
    height: 32,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a237e",
    textAlign: "center",
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
    color: "#3949ab",
    borderBottom: "0.5pt solid #e0e0e0",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
    minHeight: 14,
  },
  label: {
    fontWeight: "bold",
    width: "40%",
    color: "#333",
    fontSize: 8,
  },
  value: {
    width: "60%",
    color: "#555",
    fontSize: 8,
  },
  table: {
    marginTop: 6,
    border: "0.5pt solid #e0e0e0",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottom: "0.5pt solid #e0e0e0",
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #e0e0e0",
    paddingVertical: 4,
  },
  tableCell: {
    paddingHorizontal: 6,
    fontSize: 8,
  },
  headerCell: {
    fontWeight: "bold",
    color: "#333",
  },
  listItem: {
    marginBottom: 2,
    paddingLeft: 6,
    fontSize: 8,
  },
  emptyText: {
    fontStyle: "italic",
    color: "#999",
    fontSize: 8,
  },
  content: {
    marginTop: 0,
  },
  compactSection: {
    marginBottom: 8,
  },
  sectionGroup: {
    marginBottom: 8,
  },
});

// Función helper para nombre completo
const getFullName = (
  primerNombre?: string,
  segundoNombre?: string,
  primerApellido?: string,
  segundoApellido?: string,
): string => {
  return `${primerNombre || ""} ${segundoNombre || ""} ${primerApellido || ""} ${segundoApellido || ""}`
    .replace(/\s+/g, " ")
    .trim();
};

// Función para formatear fecha
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const isDiscapacidadItem = (item: ListaItem): item is DiscapacidadItem => {
  return "discapacidad" in item;
};
const isPatologiaItem = (item: ListaItem): item is PatologiaItem => {
  return "patologia" in item;
};
const ListaCompacta = <T extends DiscapacidadItem | PatologiaItem>({
  items,
  label,
}: {
  items: T[];
  label: string;
}) => {
  if (!items || items.length === 0) {
    return (
      <View style={styles.row}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={[styles.value, styles.emptyText]}>Ninguna</Text>
      </View>
    );
  }
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}:</Text>
      <View style={styles.value}>
        {items.map((item, idx) => {
          let texto = "";
          const categoria = item.categoria?.nombre_categoria || "Sin categoría";
          if (isDiscapacidadItem(item)) {
            texto = item.discapacidad;
          } else if (isPatologiaItem(item)) {
            texto = item.patologia;
          } else {
            // Fallback para cualquier otro tipo
            texto = JSON.stringify(item);
          }

          return (
            <Text key={idx} style={styles.listItem}>
              • {texto} ({categoria})
            </Text>
          );
        })}
      </View>
    </View>
  );
};

// Componente principal optimizado
export function ReportFamilyPDF({ employeeData }: { employeeData: Family[] }) {
  return (
    <Document>
      {employeeData.map((empleado, empleadoIndex) => {
        // Primero: Página del empleado
        const employeePage = (
          <Page
            key={`empleado-${empleado.cedula_empleado}-${empleadoIndex}`}
            size="A4"
            style={styles.page}
            wrap
          >
            {/* Header */}
            <View style={styles.header} fixed>
              <Image src={logoOAC.src} style={styles.logo} />
              <Image src={juntosPorVida.src} style={styles.logo} />
            </View>

            {/* Footer con banner que ocupa todo el ancho */}
            <View style={styles.footer} fixed>
              <View style={styles.footerBannerContainer}>
                <Image src={cintillo.src} style={styles.footerImage} />
              </View>
              <Text style={styles.footerText}>
                Documento confidencial - Uso exclusivo para fines
                administrativos - Página de información del trabajador
              </Text>
            </View>

            {/* Contenido principal optimizado */}
            <View style={styles.content}>
              <Text style={styles.title}>
                REPORTE FAMILIAR DETALLADO - TRABAJADOR
              </Text>

              {/* Datos del empleado - más compacto */}
              <View style={[styles.section, styles.compactSection]}>
                <Text style={styles.sectionTitle}>DATOS DEL TRABAJADOR</Text>

                <View style={styles.row}>
                  <Text style={styles.label}>Cédula:</Text>
                  <Text style={styles.value}>
                    {empleado.cedula_empleado || "N/A"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Nombre:</Text>
                  <Text style={styles.value}>
                    {empleado.nombre_empleado || "N/A"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Sexo:</Text>
                  <Text style={styles.value}>
                    {empleado.sexo_empleado?.sexo || "N/A"}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Cargo:</Text>
                  <Text style={styles.value}>
                    {/* {empleado.denominacion_cargo?.denominacion_cargo || "N/A"} */}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Cargo Específico:</Text>
                  <Text style={styles.value}>
                    {/* {empleado.denominacion_cargo_especifico?.denominacion_cargo || "N/A"} */}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Nómina:</Text>
                  <Text style={styles.value}>
                    {/* {empleado.tipo_nomina?.tipo_nomina || "N/A"} */}
                  </Text>
                </View>
              </View>

              {/* Tabla resumen de familiares - más compacta */}
              <View style={[styles.section, styles.compactSection]}>
                <Text style={styles.sectionTitle}>
                  FAMILIARES REGISTRADOS ({empleado.familiares?.length || 0})
                </Text>

                {empleado.familiares && empleado.familiares.length > 0 ? (
                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.headerCell,
                          { width: "38%" },
                        ]}
                      >
                        Nombre
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.headerCell,
                          { width: "17%" },
                        ]}
                      >
                        Cédula
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.headerCell,
                          { width: "25%" },
                        ]}
                      >
                        Parentesco
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.headerCell,
                          { width: "20%" },
                        ]}
                      >
                        Nacimiento
                      </Text>
                    </View>

                    {empleado.familiares.map((familiar, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: "38%" }]}>
                          {getFullName(
                            familiar.primer_nombre,
                            familiar.segundo_nombre,
                            familiar.primer_apellido,
                            familiar.segundo_apellido,
                          ) || "N/A"}
                        </Text>
                        <Text style={[styles.tableCell, { width: "17%" }]}>
                          {familiar.cedulaFamiliar || "N/A"}
                        </Text>
                        <Text style={[styles.tableCell, { width: "25%" }]}>
                          {familiar.parentesco?.descripcion_parentesco || "N/A"}
                        </Text>
                        <Text style={[styles.tableCell, { width: "20%" }]}>
                          {formatDate(familiar.fechanacimiento)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    No se registraron familiares
                  </Text>
                )}
              </View>
            </View>
          </Page>
        );

        // Segundo: Páginas de familiares optimizadas
        const familyPages =
          empleado.familiares?.map((familiar, familiarIndex) => (
            <Page
              key={`familiar-${familiar.id || familiarIndex}-${empleado.cedula_empleado}`}
              size="A4"
              style={styles.page}
              break // Esto hace que sea una página nueva
              wrap
            >
              {/* Header */}
              <View style={styles.header} fixed>
                <Image src={logoOAC.src} style={styles.logo} />
                <Image src={juntosPorVida.src} style={styles.logo} />
              </View>

              {/* Footer con banner ancho */}
              <View style={styles.footer} fixed>
                <View style={styles.footerBannerContainer}>
                  <Image src={cintillo.src} style={styles.footerImage} />
                </View>
                <Text style={styles.footerText}>
                  Documento confidencial - Uso exclusivo para fines
                  administrativos - Página del familiar{" "}
                  {familiar.primer_nombre || ""}{" "}
                  {familiar.primer_apellido || ""}
                </Text>
              </View>

              {/* Contenido del familiar optimizado */}
              <View style={styles.content}>
                <Text style={styles.title}>
                  DETALLE DE FAMILIAR - {empleado.nombre_empleado}
                </Text>

                {/* Datos personales en grupo compacto */}
                <View style={styles.sectionGroup}>
                  <View style={[styles.section, styles.compactSection]}>
                    <Text style={styles.sectionTitle}>DATOS PERSONALES</Text>

                    <View style={styles.row}>
                      <Text style={styles.label}>Cédula:</Text>
                      <Text style={styles.value}>
                        {familiar.cedulaFamiliar || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Nombre:</Text>
                      <Text style={styles.value}>
                        {getFullName(
                          familiar.primer_nombre,
                          familiar.segundo_nombre,
                          familiar.primer_apellido,
                          familiar.segundo_apellido,
                        ) || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Parentesco:</Text>
                      <Text style={styles.value}>
                        {familiar.parentesco?.descripcion_parentesco || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Nacimiento:</Text>
                      <Text style={styles.value}>
                        {formatDate(familiar.fechanacimiento)}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Sexo:</Text>
                      <Text style={styles.value}>
                        {familiar.sexo?.sexo || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Estado Civil:</Text>
                      <Text style={styles.value}>
                        {familiar.estadoCivil?.estadoCivil || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Mismo Ente:</Text>
                      <Text style={styles.value}>
                        {familiar.mismo_ente ? "Sí" : "No"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Heredero:</Text>
                      <Text style={styles.value}>
                        {familiar.heredero ? "Sí" : "No"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Perfil de Salud más compacto */}
                <View style={styles.sectionGroup}>
                  <View style={[styles.section, styles.compactSection]}>
                    <Text style={styles.sectionTitle}>PERFIL DE SALUD</Text>

                    <View style={styles.row}>
                      <Text style={styles.label}>Grupo Sanguíneo:</Text>
                      <Text style={styles.value}>
                        {familiar.perfil_salud_familiar?.grupoSanguineo
                          ?.GrupoSanguineo || "N/A"}
                      </Text>
                    </View>

                    {/* Usar componente compacto para listas con tipos específicos */}
                    {familiar.perfil_salud_familiar?.discapacidad && (
                      <ListaCompacta<DiscapacidadItem>
                        items={familiar.perfil_salud_familiar.discapacidad}
                        label="Discapacidades"
                      />
                    )}

                    {familiar.perfil_salud_familiar?.patologiasCronicas && (
                      <ListaCompacta<PatologiaItem>
                        items={
                          familiar.perfil_salud_familiar.patologiasCronicas
                        }
                        label="Patologías"
                      />
                    )}
                  </View>
                </View>

                {/* Perfil Físico en una sola fila si es posible */}
                <View style={styles.sectionGroup}>
                  <View style={[styles.section, styles.compactSection]}>
                    <Text style={styles.sectionTitle}>PERFIL FÍSICO</Text>

                    <View style={styles.row}>
                      <Text style={styles.label}>Tallas:</Text>
                      {/* <Text style={styles.value}>
                      Camisa: {familiar.perfil_fisico_familiar?.tallaCamisa?.tallaCamisa || "N/A"} | 
                      Pantalón: {familiar.perfil_fisico_familiar?.tallaPantalon?.tallaPantalon || "N/A"} | 
                      Zapatos: {familiar.perfil_fisico_familiar?.tallaZapatos?.tallaZapatos || "N/A"}
                    </Text> */}
                    </View>
                  </View>
                </View>

                {/* Formación Académica compacta */}
                <View style={styles.sectionGroup}>
                  <View style={[styles.section, styles.compactSection]}>
                    <Text style={styles.sectionTitle}>FORMACIÓN ACADÉMICA</Text>

                    <View style={styles.row}>
                      <Text style={styles.label}>Nivel:</Text>
                      <Text style={styles.value}>
                        {/* {familiar.formacion_academica_familiar?.nivelAcademico?.nivelAcademico?.nivelacademico ||
                       familiar.formacion_academica_familiar?.nivelAcademico?.nivelacademico ||
                       "N/A"} */}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Institución:</Text>
                      <Text style={styles.value}>
                        {familiar.formacion_academica_familiar?.institucion ||
                          "N/A"}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Carrera:</Text>
                      <Text style={styles.value}>
                        {/* {familiar.formacion_academica_familiar?.carrera?.nombre_carrera ||
                       familiar.formacion_academica_familiar?.carrera?.carrera?.nombre_carrera ||
                       "N/A"} */}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.label}>Mención:</Text>
                      <Text style={styles.value}>
                        {/* {familiar.formacion_academica_familiar?.mencion?.nombre_mencion ||
                       familiar.formacion_academica_familiar?.mencion?.mension?.nombre_mencion ||
                       "N/A"} */}
                      </Text>
                    </View>

                    {familiar.formacion_academica_familiar?.capacitacion && (
                      <View style={styles.row}>
                        <Text style={styles.label}>Capacitación:</Text>
                        <Text style={styles.value}>
                          {familiar.formacion_academica_familiar.capacitacion}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Observaciones solo si existe */}
                {familiar.observaciones && (
                  <View style={styles.sectionGroup}>
                    <View style={[styles.section, styles.compactSection]}>
                      <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
                      <Text style={[styles.value, { fontSize: 8 }]}>
                        {familiar.observaciones}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Page>
          )) || [];

        // Retornar todas las páginas: primero la del empleado, luego las de familiares
        return [employeePage, ...familyPages];
      })}
    </Document>
  );
}
