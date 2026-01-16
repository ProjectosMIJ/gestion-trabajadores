"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getKPIData } from "@/app/actions/hr-actions"
import type { KPIData } from "@/lib/types/hr"
import { Users, UserPlus, UserMinus, Heart } from "lucide-react"

export function KPICards() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadKPI() {
      try {
        const data = await getKPIData()
        setKpiData(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadKPI()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!kpiData) return null

  const kpis = [
    {
      title: "Empleados Activos",
      value: kpiData.activeEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Nuevos Ingresos",
      subtitle: "Últimos 30 días",
      value: kpiData.newHires,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Próximos Egresos",
      subtitle: "Próximos 30 días",
      value: kpiData.upcomingEgress,
      icon: UserMinus,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Familiares Registrados",
      value: kpiData.familyMembers,
      icon: Heart,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">{kpi.title}</CardTitle>
              <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            {kpi.subtitle && <CardDescription className="text-xs">{kpi.subtitle}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
