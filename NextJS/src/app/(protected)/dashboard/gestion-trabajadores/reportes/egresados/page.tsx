import ReportLeaving from "../../components/reports/report-leaving";

export default function ReportLeavingPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6 ">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Reporte De Egresados
              </h1>
              <p className="text-muted-foreground mt-1">
                Filtre La Informacion de egresados
              </p>
            </div>
            <ReportLeaving />
          </div>
        </main>
      </div>
    </div>
  );
}
