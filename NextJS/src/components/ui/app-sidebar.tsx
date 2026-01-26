"use client";
import {
  ArrowRightFromLine,
  ArrowRightLeft,
  BadgePlus,
  BarChart3,
  BookCheck,
  Briefcase,
  BriefcaseBusiness,
  BriefcaseConveyorBelt,
  ChevronDown,
  ChevronRight,
  ContactRound,
  FileChartLine,
  Home,
  List,
  ListCheck,
  MoveDownRight,
  SignpostBig,
  User,
  UserPlus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const items = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    permission: {
      roleAccept: ["basic", "admin"],
      departmentAccept: ["RAC"],
    },
    title: "Personal Trabajador",
    url: "#",
    icon: User,

    subMenu: [
      {
        title: "Agregar Trabajador",
        url: "/dashboard/gestion-trabajadores/personal/registrar",
        icon: UserPlus,
      },
      {
        title: "Consultar Trabajador",
        url: "/dashboard/gestion-trabajadores/personal",
        icon: ListCheck,
      },
      {
        title: "Agregar Familiar",
        url: "/dashboard/gestion-trabajadores/familiares/agregar-familiar",
        icon: ContactRound,
      },
    ],
  },
  {
    permission: {
      roleAccept: ["basic", "admin"],
      departmentAccept: ["RAC"],
    },
    title: "Dependencias",
    url: "#",
    icon: SignpostBig,
    subMenu: [
      {
        title: "Crear Dependencia",
        url: "/dashboard/gestion-trabajadores/dependencias/crear-dependencia",
        icon: ArrowRightFromLine,
      },
      {
        title: "Crear Direcciones",
        url: "/dashboard/gestion-trabajadores/dependencias/crear-dependencia-direccion",
        icon: MoveDownRight,
      },
      {
        title: "Consultar Dependencias",
        url: "/dashboard/gestion-trabajadores/dependencias/listado-dependencia",
        icon: List,
      },
    ],
  },
  {
    permission: {
      roleAccept: ["basic", "admin"],
      departmentAccept: ["RAC"],
    },
    title: "Gestion De Codigos",
    url: "#",
    icon: SignpostBig,
    subMenu: [
      {
        title: "Crear Nuevo Codigo",
        url: "/dashboard/gestion-trabajadores/personal/crear-codigo",
        icon: BadgePlus,
      },
      {
        title: "Consultar Codigos",
        url: "/dashboard/gestion-trabajadores/personal/listado-codigo",
        icon: List,
      },
    ],
  },
  {
    permission: {
      roleAccept: ["basic", "admin"],
      departmentAccept: ["RAC"],
    },
    title: "Movimientos",
    url: "#",
    icon: ArrowRightLeft,
    subMenu: [
      {
        title: "Asignar Cargo",
        url: "/dashboard/gestion-trabajadores/personal/asignar-codigo",
        icon: BriefcaseBusiness,
      },
      {
        title: "Asignar Cargo Esp",
        url: "/dashboard/gestion-trabajadores/personal/asignar-codigo-especial",
        icon: Briefcase,
      },
      {
        title: "Cambiar Cargo",
        url: "/dashboard/gestion-trabajadores/personal/cambiar-codigo",
        icon: BriefcaseConveyorBelt,
      },
      {
        title: "Cambiar Estatus",
        url: "/dashboard/gestion-trabajadores/personal/cambiar-estatus",
        icon: FileChartLine,
      },
      {
        title: "Egresar/Pasivo",
        url: "/dashboard/gestion-trabajadores/personal/cambiar-pasivo",
        icon: BookCheck,
      },
    ],
  },

  { icon: BarChart3, title: "Reportes", url: "/reportes" },
];

export function AppSidebarEmployees() {
  const { data: session, status, update } = useSession();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };
  const filteredItems = items.filter((item) => {
    if (!item.permission) return true;

    const hasRolePermission = item.permission.roleAccept.includes(
      session?.user?.role || "",
    );

    const hasDepartmentPermission = item.permission.departmentAccept.includes(
      session?.user?.department || "",
    );

    return hasRolePermission && hasDepartmentPermission;
  });
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="w-full h-fit">
            <Image
              src="/logoOAC.png"
              alt="Logo 1"
              width={150}
              height={98}
              className="h-full w-full object-cover rounded-2xl"
            />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title} className={"mt-5"}>
                  {item.subMenu ? (
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleSubmenu(item.title)}
                        className="text-sm h-fit"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center  ">
                            <item.icon className="h-[16px]" />
                            <span className="ml-2 text-sm">{item.title}</span>
                          </div>
                          {openSubmenu === item.title ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </div>
                      </SidebarMenuButton>
                      {openSubmenu === item.title && (
                        <div className="pl-8 py-1 space-y-1 text-sm">
                          {item.subMenu.map((subItem) => (
                            <SidebarMenuButton
                              key={subItem.title}
                              asChild
                              className="mt-2 text-sm"
                            >
                              <Link href={subItem.url} className="text-sm">
                                <subItem.icon className="h-[32px]" />

                                {subItem.title}
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex items-center text-sm"
                      >
                        <item.icon className="h-[32px]" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
