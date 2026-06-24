"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, Briefcase, FileText } from "lucide-react";

interface OverviewData {
  totalUsers: number;
  averageScore: number;
  activeCases: number;
  pendingSubmissions: number;
}

export function OverviewCards({ data }: { data: OverviewData }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 border-0 hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-50">Total Siswa Aktif</CardTitle>
          <Users className="h-4 w-4 text-blue-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalUsers}</div>
          <p className="text-xs text-blue-100/80 mt-1">
            +12% dari bulan lalu
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 border-0 hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-50">Rata-rata Nilai</CardTitle>
          <GraduationCap className="h-4 w-4 text-purple-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageScore}</div>
          <p className="text-xs text-purple-100/80 mt-1">
            +2 poin dari minggu lalu
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/20 border-0 hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-50">Kasus PBL Aktif</CardTitle>
          <Briefcase className="h-4 w-4 text-orange-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeCases}</div>
          <p className="text-xs text-orange-100/80 mt-1">
            Dari total 15 kasus
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-0 hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-50">Menunggu Review</CardTitle>
          <FileText className="h-4 w-4 text-emerald-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pendingSubmissions}</div>
          <p className="text-xs text-emerald-100/80 mt-1">
            Submission kasus PBL
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
