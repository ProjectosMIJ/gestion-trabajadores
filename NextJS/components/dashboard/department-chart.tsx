"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getKPIData } from "@/app/actions/hr-actions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function DepartmentChart() {
  const [data, setData] = useState<Array<{ name: string; count: number; percentage: number }> | null>(null)

  useEffect(() => {
    async function loadData() {
      const kpiData = await getKPIData()
      setData(kpiData.departmentDistribution)
    }
    loadData()
  }, [])

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Distribución de Empleados</CardTitle>
        <CardDescription>Por departamento</CardDescription>
      </CardHeader>
      <CardContent>
        {data && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-card)" }} />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
