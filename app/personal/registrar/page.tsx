"use client";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { EmployeeRegistration } from "@/components/employees/employee-registration-form";
import { useEffect, useState } from "react";

export default function RegistrarEmpleadoPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <EmployeeRegistration />
          </div>
        </main>
      </div>
    </div>
  );
}
