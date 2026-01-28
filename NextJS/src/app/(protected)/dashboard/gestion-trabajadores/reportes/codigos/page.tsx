import ReportCode from "../../components/reports/report-code";

export default function ReportCodePage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Reporte De Cargos
              </h1>
              <p className="text-muted-foreground mt-1">
                Filtre La Informcacion de los Cargos
              </p>
            </div>
            <ReportCode />
          </div>
        </main>
      </div>
    </div>
  );
}
