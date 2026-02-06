import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { SessionProvider } from "next-auth/react";
import { AppSidebar } from "./components/app-sidebar";
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <AppSidebar/>
        <SidebarTrigger />
        <main className="sm:w-11/12 lg:w-11/12 ">{children}</main>
      </SidebarProvider>
    </SessionProvider>
  );
}
