import CreateDependency from "@/components/dependencias/create-dependency";
import TableDependencys from "@/components/dependencias/list-dependencys";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function ListDependencys() {
  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Listado de Dependencias
                </h1>
              </div>
              <TableDependencys />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
