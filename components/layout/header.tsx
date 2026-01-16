"use client";

export function Header() {
  return (
    <header className="border-b border-border bg-card px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Gestion de Recursos Humanos - RAC
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel de control principal
          </p>
        </div>
      </div>
    </header>
  );
}
