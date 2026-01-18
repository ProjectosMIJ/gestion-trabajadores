"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentMovements } from "@/app/actions/hr-actions"
import type { Movement } from "@/lib/types/hr"
import { ArrowRight, TrendingUp, Zap } from "lucide-react"

export function RecentMovements() {
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMovements() {
      try {
        const data = await getRecentMovements(7)
        setMovements(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadMovements()
  }, [])

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "promotion":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "transfer":
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      case "demotion":
        return <TrendingUp className="h-4 w-4 rotate-180 text-orange-600" />
      case "egress":
        return <Zap className="h-4 w-4 text-red-600" />
      default:
        return <ArrowRight className="h-4 w-4" />
    }
  }

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      promotion: "Ascenso",
      transfer: "Transferencia",
      demotion: "Descenso",
      egress: "Baja",
    }
    return labels[type] || type
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Últimos Movimientos</CardTitle>
        <CardDescription>Registros recientes de cambios en personal</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-muted p-2">{getMovementIcon(movement.type)}</div>
                  <div>
                    <p className="font-medium text-foreground">
                      {movement.employee.firstName} {movement.employee.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{getMovementLabel(movement.type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{movement.fromPosition}</p>
                  <p className="text-xs text-muted-foreground">{new Date(movement.date).toLocaleDateString("es-ES")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
