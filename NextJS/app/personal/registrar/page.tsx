"use client";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import MultiStepForm from "./forms/form-multi-steps";

export default function RegistrarEmpleadoPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* <EmployeeRegistration /> */}
            <MultiStepForm />
          </div>
        </main>
      </div>
    </div>
  );
}
