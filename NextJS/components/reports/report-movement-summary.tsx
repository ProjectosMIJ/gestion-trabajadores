"use client";

import { getReportStatus, getReportTypePerson } from "@/app/api/getInfoRac";
import { ApiResponse, ReportStatus, ReportTypePerson } from "@/app/types/types";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ReportMovementSummary() {
  const [movementData, setMovementData] = useState<
    {
      type: string;
      count: number;
    }[]
  >([
    { type: "ACTIVO", count: 0 },
    { type: "VACANTE", count: 0 },
  ]);
  const [report, setReport] = useState<ApiResponse<ReportStatus[]>>({
    message: "",
    status: "",
    data: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const reportData = await getReportStatus();
      setReport(reportData);
    };
    loadData();
  }, []);
  useEffect(() => {
    if (report.data) {
      const updatedData = movementData.map((item) => {
        const reportItem = report.data.find(
          (apiItem) => apiItem.estatusid__estatus === item.type
        );
        console.log(reportItem);
        return {
          type: item.type,
          count: reportItem ? reportItem.count : 0,
        };
      });

      setMovementData(updatedData);
    }
  }, [report.data]);
  return (
    <Card className="bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Resumen del Personal
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={movementData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="type" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Bar
            dataKey="count"
            fill="var(--chart-1)"
            radius={[8, 8, 0, 0]}
            name="Cantidad"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
