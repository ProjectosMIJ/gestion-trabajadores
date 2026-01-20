"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lock, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
type Department = {
  id: string;
  name: string;
  imageSrc: string;
  href: string;
  color: string;
  alt: string;
};
const departments: Department[] = [
  {
    id: "beneficios",
    name: "Beneficios",
    imageSrc: "/images/departments/beneficios.png",
    href: "dashboard/beneficios/",
    color: "bg-blue-500",
    alt: "Farmacia moderna con estantes llenos de medicamentos, productos de cuidado personal y un mostrador de atención al cliente.",
  },
  {
    id: "farmacia",
    name: "Farmacia",
    imageSrc: "/images/departments/farmacia.jpg",
    href: "dashboard/farmacia/",
    color: "bg-blue-500",
    alt: "Farmacia moderna con estantes llenos de medicamentos, productos de cuidado personal y un mostrador de atención al cliente.",
  },
  {
    id: "servicio medico",
    name: "servicio médico",
    imageSrc: "/images/departments/medicina.jpg",
    href: "dashboard/servicio-medico/",
    color: "bg-green-500",
    alt: "Consultorio médico con equipo de diagnóstico y profesional atendiendo a un paciente.",
  },
  {
    id: "oac",
    name: "Oficina de Atención al Ciudadano",
    imageSrc: "/images/departments/oac.png",
    href: "dashboard/oac/",
    color: "bg-green-500",
    alt: "Oficina de atención al ciudadano con mostradores de servicio, funcionarios públicos atendiendo y fila de usuarios esperando.",
  },
  {
    id: "Seguridad",
    name: "Seguridad",
    imageSrc: "/images/departments/seguridad.jpg",
    href: "/dashboard/seguridad",
    color: "bg-green-500",
    alt: "Sección de seguridad y privacidad.",
  },
  {
    id: "oac",
    name: "Gestión de Trabajadores",
    imageSrc: "/images/departments/datos.jpg",
    href: "/dashboard/gestion-trabajadores",
    color: "bg-green-500",
    alt: "Human Resources Department",
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleDepartmentValidation = (
    departmentId: string,
    departmentHref: string,
  ) => {
    if (session?.user?.department === departmentId) {
      toast.success(`Bienvenido ${session.user.name}`, {
        style: {
          color: "white",
        },
      });
      router.push(departmentHref);
    } else {
      toast.warning("No puedes acceder a este modulo", {
        style: {
          color: "white",
        },
      });
    }
  };
  return (
    <>
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}
      <div className="flex flex-col items-center mb-10 mt-4">
        <h1 className="text-3xl font-bold mb-2 text-white text-center">
          Sistema de Información Integral
        </h1>
        <p className=" text-2xl text-center text-white ">
          Seleccione un módulo para acceder a sus funciones
        </p>
      </div>
      <div className="grid overflow-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-8 ">
        {departments.map((department, index) => {
          const hasAccess = session?.user?.department === department.id;
          return (
            <Card
              key={index}
              onClick={() =>
                handleDepartmentValidation(department.id, department.href)
              }
              className={` block transition-all  duration-200 p-0 ${
                hasAccess
                  ? "hover:scale-105 cursor-pointer"
                  : "opacity-75 cursor-not-allowed"
              }`}
            >
              {!hasAccess && (
                <div
                  dir="rtl"
                  className="relative w-fit top-4 end-0 z-10 bg-gray-800 text-white p-1 rounded-full"
                >
                  <Lock size={18} />
                </div>
              )}

              {hasAccess && (
                <div
                  dir="rtl"
                  className="relative w-fit top-4 end-0 z-10 bg-green-700 text-white p-1 rounded-full"
                >
                  <Check size={18} />
                </div>
              )}
              <Image
                height={150}
                width={100}
                src={department.imageSrc}
                alt={department.alt}
                className={`w-full h-60 object-contain ${
                  hasAccess
                    ? `hover:border-primary`
                    : "border-gray-300 bg-gray-100 grayscale"
                } overflow-hidden relative`}
              />
              <Card className="rounded text-center bg-slate-200/25 ">
                <CardHeader>
                  <CardTitle className="text-xl">{department.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center h-full">
                  {hasAccess ? (
                    <p className="text-sm text-gray-700">
                      Tienes acceso a este departamento.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">
                      No tiene accedo a este departamento
                    </p>
                  )}
                </CardContent>
              </Card>
            </Card>
          );
        })}
      </div>
    </>
  );
}
