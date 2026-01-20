import { CreateFamilyForm } from "../../components/employees/crear-familiar";

export default function CreateFamilyPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Agregar Familiar
              </h1>
              <p className="text-muted-foreground mt-1">
                Registre los familiares del empleado
              </p>
            </div>
          </div>
          <CreateFamilyForm />
        </main>
      </div>
    </div>
  );
}
