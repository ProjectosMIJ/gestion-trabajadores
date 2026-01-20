"use client";
import {
  Calendar,
  Home,
  Inbox,
  ChevronDown,
  ChevronRight,
  PersonStandingIcon,
  HandHelping,
  MemoryStick,
  BadgeCheck,
  CalendarArrowDown,
  Speech,
  Blocks,
  BriefcaseMedical,
  Heart,
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
import { useState } from "react";
import { SignOut } from "./signout-button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

const items = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    permission: {
      roleAccept: ["basic", "admin"],
      departmentAccept: ["oac"],
    },
    title: "Perfil",
    url: "/dashboard/oac",
    icon: PersonStandingIcon,
  },
  {
    permission: {
      roleAccept: ["basic", "admin"],
      departmentAccept: ["oac"],
    },
    title: "Crear solicitud Tecnica/Social",
    url: "#",
    icon: HandHelping,
    submenu: [
      {
        icon: Speech,
        title: "Personal Interno",
        url: "/dashboard/oac/ayudas/interno/social_tecnica",
      },
      {
        icon: Blocks,
        title: "Personal Externo",
        url: "/dashboard/oac/ayudas/externo/social_tecnica",
      },
      {
        icon: Blocks,
        title: "Entes",
        url: "/dashboard/oac/ayudas/entes",
      },
      {
        icon: BriefcaseMedical,
        title: "Medica",
        url: "/dashboard/oac/ayudas/medicas",
      },
    ],
  },

  {
    permission: {
      roleAccept: ["admin"],
      departmentAccept: ["oac"],
    },
    title: "Solictudes",
    url: "/dashboard/oac/solicitudes",
    icon: Calendar,
    submenu: [
      {
        icon: CalendarArrowDown,
        title: "Pendientes",
        url: "/dashboard/oac/solicitudes/pendientes",
      },
      {
        icon: BadgeCheck,
        title: "Aprobadas",
        url: "/dashboard/oac/solicitudes/aprobadas",
      },
    ],
  },
  {
    permission: {
      roleAccept: ["admin"],
      departmentAccept: ["oac"],
    },
    title: "Inventario",
    url: "/dashboard/oac/admin/inventario",
    icon: MemoryStick,
  },

  {
    permission: {
      roleAccept: ["admin"],
      departmentAccept: ["oac"],
    },
    title: "Historico",
    url: "",
    icon: Inbox,
    submenu: [
      {
        icon: Inbox,
        title: "Historico Tecnico/Social",
        url: "/dashboard/oac/historico",
      },
      {
        icon: Heart,
        title: "Historico de Farmacia/Medicamentos",
        url: "/dashboard/oac/historico/historico_farmacia",
      },
    ],
  },

  {
    permission: {
      roleAccept: ["admin"],
      departmentAccept: ["Seguridad"],
    },
    title: "Creacion de usuarios",
    url: "/dashboard/seguridad",
    icon: Calendar,
  },
  {
    permission: {
      roleAccept: ["admin"],
      departmentAccept: ["Seguridad"],
    },
    title: "Gestion de Usuarios",
    url: "/dashboard/seguridad/Gestion-de-Usuario",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();

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
                  {item.submenu ? (
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
                          {item.submenu.map((subItem) => (
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
              {/* el boton no me lio los estilos asi que le pise este div unicamente para que agarre el espacio de separacion */}
              <SignOut />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
