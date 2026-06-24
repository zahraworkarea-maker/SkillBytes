"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

export interface AssessmentScoreData {
  level: string;
  score: number;
}

const chartConfig = {
  score: {
    label: "Avg Score",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function AssessmentBarChart({ data }: { data: AssessmentScoreData[] }) {
  return (
    <Card className="border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle>Rata-rata Nilai Assessment</CardTitle>
        <CardDescription>Berdasarkan tingkat kesulitan (Level)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: -20,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="level"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="score"
              fill="var(--color-score)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
