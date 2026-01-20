import FormCreateDirectionDependency from "../../components/dependencias/create-direction-dependency";

export default function CreateDirection() {
  return (
    <>
      <div className="flex h-screen bg-background">
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Crear Direcciones
                </h1>
              </div>
              <FormCreateDirectionDependency />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
