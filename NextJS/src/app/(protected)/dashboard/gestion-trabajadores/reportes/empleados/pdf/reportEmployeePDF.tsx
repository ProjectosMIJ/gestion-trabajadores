import { EmployeeData } from "@/app/types/types";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Registrar fuentes si es necesario

// Crear estilos
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoLeft: {
    width: 100,
    height: 60,
  },
  logoRight: {
    width: 100,
    height: 60,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666666",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
    borderBottomStyle: "solid",
    minHeight: 30,
  },
  tableRowHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCol: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    borderRightStyle: "solid",
  },
  col1: {
    width: "8%",
  },
  col2: {
    width: "15%",
  },
  col3: {
    width: "20%",
  },
  col4: {
    width: "15%",
  },
  col5: {
    width: "20%",
  },
  col6: {
    width: "22%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  footerImage: {
    width: "100%",
    height: "100%",
  },
  pageNumber: {
    position: "absolute",
    bottom: 70,
    right: 30,
    fontSize: 10,
    color: "#666666",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    backgroundColor: "#e8e8e8",
    padding: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 150,
    fontSize: 10,
    fontWeight: "bold",
  },
  infoValue: {
    fontSize: 10,
    flex: 1,
  },
});

// Datos de ejemplo para logos y footer
// Reemplaza estas URLs con las reales

export function ReportPDFEmployee({
  employeeData,
  id,
}: {
  employeeData: EmployeeData[];
  id: string;
}) {
  return (
    <Document>
      {employeeData.map((employee, index) => (
        <Page key={employee.id} size="A4" style={styles.page} wrap>
          {/* Logos en la cabecera */}
          <View style={styles.header} fixed>
            <Image style={styles.logoLeft} src={"/logoNuevo.png"} />
            <Image style={styles.logoRight} src={"/juntosPorVida.png"} />
          </View>

          {/* Título principal */}
          <View>
            <Text style={styles.title}>
              REPORTE DE INFORMACIÓN DEL EMPLEADO
            </Text>
            <Text style={styles.subtitle}>
              Generado Por {id}, Fecha de generación:{" "}
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Información básica del empleado */}
          <View>
            <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cédula de Identidad:</Text>
              <Text style={styles.infoValue}>{employee.cedulaidentidad}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombres y Apellidos:</Text>
              <Text style={styles.infoValue}>
                {employee.nombres} {employee.apellidos}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
              <Text style={styles.infoValue}>
                {new Date(employee.fecha_nacimiento).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sexo:</Text>
              <Text style={styles.infoValue}>{employee.sexo.sexo}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado Civil:</Text>
              <Text style={styles.infoValue}>
                {employee.estadoCivil.estadoCivil}
              </Text>
            </View>
          </View>

          {/* Información de formación académica */}
          <View>
            <Text style={styles.sectionTitle}>FORMACIÓN ACADÉMICA</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nivel Académico:</Text>
              <Text style={styles.infoValue}>
                {employee.formacion_academica.nivelAcademico?.nivelacademico ||
                  "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Institución:</Text>
              <Text style={styles.infoValue}>
                {employee.formacion_academica.institucion || "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Carrera:</Text>
              <Text style={styles.infoValue}>
                {employee.formacion_academica.carrera?.nombre_carrera ||
                  "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mención:</Text>
              <Text style={styles.infoValue}>
                {employee.formacion_academica.mension?.nombre_mencion ||
                  "No especificado"}
              </Text>
            </View>
          </View>

          {/* Tabla de asignaciones */}
          <View>
            <Text style={styles.sectionTitle}>ASIGNACIONES LABORALES</Text>

            <View style={styles.table}>
              {/* Encabezado de la tabla */}
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCol, styles.col1]}>#</Text>
                <Text style={[styles.tableCol, styles.col2]}>Código</Text>
                <Text style={[styles.tableCol, styles.col3]}>
                  Cargo Especifico
                </Text>
                <Text style={[styles.tableCol, styles.col4]}>Grado</Text>
                <Text style={[styles.tableCol, styles.col5]}>Nómina</Text>
                <Text style={[styles.tableCol, styles.col6]}>Direccion</Text>
              </View>

              {/* Filas de datos */}
              {employee.asignaciones.map((asignacion, idx) => (
                <View key={asignacion.id} style={styles.tableRow}>
                  <Text style={[styles.tableCol, styles.col1]}>{idx + 1}</Text>
                  <Text style={[styles.tableCol, styles.col2]}>
                    {asignacion.codigo}
                  </Text>
                  <Text style={[styles.tableCol, styles.col3]}>
                    {asignacion.denominacioncargoespecifico.cargo}
                  </Text>
                  <Text style={[styles.tableCol, styles.col4]}>
                    {asignacion?.grado?.grado ?? "N/A"}
                  </Text>
                  <Text style={[styles.tableCol, styles.col5]}>
                    {asignacion.tiponomina.nomina}
                  </Text>
                  <Text style={[styles.tableCol, styles.col6]}>
                    {asignacion.Coordinacion?.coordinacion ||
                      asignacion.DireccionLinea?.direccion_linea ||
                      asignacion.DireccionGeneral?.direccion_general ||
                      "No especificado"}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Información de salud */}
          <View>
            <Text style={styles.sectionTitle}>PERFIL DE SALUD</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Grupo Sanguíneo:</Text>
              <Text style={styles.infoValue}>
                {employee?.perfil_salud?.grupoSanguineo?.GrupoSanguineo ??
                  "N/A"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Discapacidades:</Text>
              <Text style={styles.infoValue}>
                {employee.perfil_salud?.discapacidad &&
                employee.perfil_salud.discapacidad.length > 0
                  ? employee.perfil_salud.discapacidad
                      .map((d) => d.discapacidad)
                      .join(", ")
                  : "Ninguna"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patologías Crónicas:</Text>
              <Text style={styles.infoValue}>
                {employee.perfil_salud?.patologiasCronicas &&
                employee.perfil_salud.patologiasCronicas.length > 0
                  ? employee.perfil_salud.patologiasCronicas
                      .map((p) => p.patologia)
                      .join(", ")
                  : "Ninguna"}
              </Text>
            </View>
          </View>

          {/* Información física */}
          <View>
            <Text style={styles.sectionTitle}>PERFIL FÍSICO</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Talla Camisa:</Text>
              <Text style={styles.infoValue}>
                {employee?.perfil_fisico?.tallaCamisa?.talla ??
                  "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Talla Pantalón:</Text>
              <Text style={styles.infoValue}>
                {employee?.perfil_fisico?.tallaPantalon?.talla ??
                  "No especificado"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Talla Zapatos:</Text>
              <Text style={styles.infoValue}>
                {employee?.perfil_fisico?.tallaZapatos?.talla ??
                  "No especificado"}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Image style={styles.footerImage} src={"/cintillo2.png"} />
          </View>

          {/* Número de página */}
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Empleado ${index + 1} de ${employeeData.length} - Página ${pageNumber} de ${totalPages}`
            }
            fixed
          />
        </Page>
      ))}
    </Document>
  );
}
