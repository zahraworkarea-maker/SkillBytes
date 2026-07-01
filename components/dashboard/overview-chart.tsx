'use client'

import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { useInView } from '@/hooks/use-in-view'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function OverviewChart({ dashboardData }: { dashboardData?: any }) {
  const { ref, isInView } = useInView()

  const currentMonthIndex = new Date().getMonth().toString();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);

  const selectedYear = new Date().getFullYear();
  const daysInMonth = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();

  // Initialize map for daily data
  const dailyMap = new Map();
  for (let i = 1; i <= daysInMonth; i++) {
    dailyMap.set(i.toString(), { date: i.toString(), pblSum: 0, pblCount: 0, assesmenSum: 0, assesmenCount: 0 });
  }

  // Aggregate Assesmen
  if (dashboardData?.rawAssessmentResults) {
    dashboardData.rawAssessmentResults.forEach((result: any) => {
      if (result.created_at && result.score != null) {
        const d = new Date(result.created_at);
        if (d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === selectedYear) {
          const day = d.getDate().toString();
          const stat = dailyMap.get(day);
          if (stat) {
            stat.assesmenSum += Number(result.score);
            stat.assesmenCount += 1;
          }
        }
      }
    });
  }

  // Aggregate PBL
  if (dashboardData?.rawPblSubmissions) {
    dashboardData.rawPblSubmissions.forEach((sub: any) => {
      if (sub.created_at && sub.score != null) {
        const d = new Date(sub.created_at);
        if (d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === selectedYear) {
          const day = d.getDate().toString();
          const stat = dailyMap.get(day);
          if (stat) {
            stat.pblSum += Number(sub.score);
            stat.pblCount += 1;
          }
        }
      }
    });
  }

  let hasRealData = false;
  const overviewData = Array.from(dailyMap.values()).map(s => {
    if (s.pblCount > 0 || s.assesmenCount > 0) hasRealData = true;
    return {
      date: s.date,
      pbl: s.pblCount > 0 ? Math.round(s.pblSum / s.pblCount) : 0,
      assesmen: s.assesmenCount > 0 ? Math.round(s.assesmenSum / s.assesmenCount) : 0,
    };
  });

  // Fallback to dummy data ONLY if backend data hasn't loaded properly
  if (!hasRealData && (!dashboardData || !dashboardData.rawAssessmentResults)) {
    for (let i = 0; i < daysInMonth; i++) {
      const day = i + 1;
      overviewData[i].pbl = Math.min(100, 75 + Math.floor(10 * Math.sin(day / 4)) + (day % 3));
      overviewData[i].assesmen = Math.min(100, 80 + Math.floor(8 * Math.cos(day / 5)) + (day % 2));
    }
  }

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4" style={{
        animation: isInView ? 'fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both' : 'none',
        opacity: isInView ? 1 : 0,
      }}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Overview</h3>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap ml-auto md:ml-4">
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs md:text-sm text-gray-500">PBL</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs md:text-sm text-gray-500">Assesmen</span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-0.5">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full min-h-64 md:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={overviewData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 13, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip
              contentStyle={{
                fontSize: 14,
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="pbl"
              name="Nilai PBL"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={overviewData.length <= 1 ? { r: 4 } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={isInView}
              animationDuration={2000}
            />
            <Line
              type="monotone"
              dataKey="assesmen"
              name="Nilai Assesmen"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={overviewData.length <= 1 ? { r: 4 } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={isInView}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
