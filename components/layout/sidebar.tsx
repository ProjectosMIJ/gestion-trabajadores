"use client";

import {
  Users,
  Users2,
  ArrowRightLeft,
  BarChart3,
  UserPlus,
  Badge,
  UserCheck,
  SignpostBig,
  ChevronRight,
  ChevronDown,
  BadgePlus,
  BriefcaseBusiness,
  Briefcase,
  BriefcaseConveyorBelt,
  FileChartLine,
  BookCheck,
  ContactRound,
  List,
  User,
  ListCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Sidebar() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems = [
    {
      icon: User,
      label: "Personal Trabajador",
      href: "#",
      subMenu: [
        {
          label: "Agregar Trabajador",
          href: "/personal/registrar",
          icon: UserPlus,
        },
        {
          label: "Consultar Trabajador",
          href: "/personal",
          icon: ListCheck,
        },
        {
          label: "Agregar Familiar",
          href: "/familiares/agregar-familiar",
          icon: ContactRound,
        },
      ],
    },

    { icon: SignpostBig, label: "Dependencias", href: "/dependencias" },

    {
      icon: Badge,
      label: "Gestion De Codigos",
      href: "#",
      subMenu: [
        {
          label: "Crear Nuevo Codigo",
          href: "/personal/crear-codigo",
          icon: BadgePlus,
        },
        {
          label: "Listado de Codigo",
          href: "/personal/listado-codigo",
          icon: List,
        },
      ],
    },
    {
      icon: ArrowRightLeft,
      label: "Movimientos",
      href: "#",
      subMenu: [
        {
          label: "Asignar Cargo",
          href: "/personal/asignar-codigo",
          icon: BriefcaseBusiness,
        },
        {
          label: "Asignar Cargo Esp",
          href: "/personal/asignar-codigo-especial",
          icon: Briefcase,
        },
        {
          label: "Cambiar Cargo",
          href: "/personal/cambiar-codigo",
          icon: BriefcaseConveyorBelt,
        },
        {
          label: "Cambiar Estatus",
          href: "/personal/cambiar-estatus",
          icon: FileChartLine,
        },
        {
          label: "Egresar/Pasivo",
          href: "/personal/cambiar-pasivo",
          icon: BookCheck,
        },
      ],
    },

    { icon: BarChart3, label: "Reportes", href: "/reportes" },
  ];

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <aside className="w-64 border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h2 className="text-lg font-bold text-black">RAC</h2>
      </div>
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const hasSubmenu = item.subMenu && item.subMenu.length > 0;

          return (
            <div key={item.label} className="space-y-1">
              {hasSubmenu ? (
                <>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    className="w-full justify-between text-black hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </div>
                    {openSubmenu === item.label ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {openSubmenu === item.label && (
                    <div className="ml-6 space-y-1 border-l border-border pl-3">
                      {item.subMenu.map((subItem) => (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant="ghost"
                            type="button"
                            className="w-full justify-start text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <subItem.icon className="mr-3 h-4 w-4" />
                            {subItem.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    type="button"
                    className="w-full justify-start text-black hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
