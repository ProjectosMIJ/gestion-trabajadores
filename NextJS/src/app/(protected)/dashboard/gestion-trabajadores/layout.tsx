import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebarEmployees } from "../../../../components/ui/app-sidebar";
import { SessionProvider } from "next-auth/react";
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebarEmployees />
        <SidebarTrigger />
        <main className="sm:w-11/12 lg:w-11/12 ">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  );
}
