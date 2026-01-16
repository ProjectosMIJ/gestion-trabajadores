import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportTurnover } from "@/components/reports/report-turnover";
import { ReportTrends } from "@/components/reports/report-trends";
import { ReportDistribution } from "@/components/reports/report-distribution";
import { ReportMovementSummary } from "@/components/reports/report-movement-summary";

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
              <p className="mt-1 text-muted-foreground">
                Análisis y métricas de recursos humanos
              </p>
            </div>

            {/* Filters */}
            {/* <ReportFilters /> */}

            {/* Reports Grid */}
            {/* <div className="grid gap-6 lg:grid-cols-2">
              <ReportTurnover />
              <ReportTrends />
            </div> */}

            <div className="grid gap-6 lg:grid-cols-2">
              <ReportDistribution />
              <ReportMovementSummary />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
