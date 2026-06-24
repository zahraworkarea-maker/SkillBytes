"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface SubmissionStatusData {
  status: string;
  value: number;
}

const chartConfig = {
  value: {
    label: "Total",
  },
  Completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  Reviewed: {
    label: "Reviewed",
    color: "hsl(var(--chart-2))",
  },
  Pending: {
    label: "Pending",
    color: "hsl(var(--chart-3))",
  },
  Failed: {
    label: "Failed",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export function SubmissionStatusChart({ data }: { data: SubmissionStatusData[] }) {
  // Add colors based on status
  const chartData = data.map((item) => {
    let fill = "#6366f1"; // indigo-500
    if (item.status === "Reviewed" || item.status === "Completed") fill = "#10b981"; // emerald-500
    else if (item.status === "Pending") fill = "#f59e0b"; // amber-500
    else if (item.status === "Failed") fill = "#f43f5e"; // rose-500
    return { ...item, fill };
  });

  return (
    <Card className="flex flex-col border-t-4 border-t-pink-500 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-pink-700">Status Tugas PBL</CardTitle>
        <CardDescription>Bulan Ini</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
