import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebarEmployees } from "../../../../components/ui/app-sidebar";
import { HeaderLayout } from "./components/layout/header";
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebarEmployees />
      <SidebarInset className="bg-transparent">
        <HeaderLayout
          title="Gestion de Trabajadores - RAC"
          subtitle="Gestiona Y Visualiza La Informacion De Los Empleados"
        >
          <SidebarTrigger className="text-black-600   scale-110" />
        </HeaderLayout>
        <main className=" w-full h-full overflow-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
