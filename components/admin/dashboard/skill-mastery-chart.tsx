"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export interface SkillMasteryData {
  day: string;
  mastery: number;
}

const chartConfig = {
  mastery: {
    label: "Mastery (%)",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

export function SkillMasteryChart({ data }: { data: SkillMasteryData[] }) {
  return (
    <Card className="border-t-4 border-t-violet-500 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-violet-700">Skill Mastery Trajectory (DKT)</CardTitle>
        <CardDescription>Rata-rata probabilitas penguasaan minggu ini</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: -20,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="mastery"
              type="natural"
              fill="url(#fillMastery)"
              fillOpacity={0.4}
              stroke="var(--color-mastery)"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="fillMastery" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mastery)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mastery)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Meningkat 15% dari minggu lalu <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Berdasarkan riwayat percobaan quiz siswa
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
