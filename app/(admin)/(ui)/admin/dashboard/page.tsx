"use client";

import { useEffect, useState } from "react";
import { OverviewCards } from "@/components/admin/dashboard/overview-cards";
import { SkillMasteryChart } from "@/components/admin/dashboard/skill-mastery-chart";
import { AssessmentBarChart } from "@/components/admin/dashboard/assessment-bar-chart";
import { RecentActivityTable } from "@/components/admin/dashboard/recent-activity-table";
import { SubmissionStatusChart } from "@/components/admin/dashboard/submission-status-chart";
import { LeaderboardList } from "@/components/admin/dashboard/leaderboard-list";
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Download, Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardService } from "@/lib/api-services";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        if (response.success) {
          setData(response.data);
        } else {
          toast.error("Gagal mengambil data dashboard.");
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Terjadi kesalahan saat mengambil data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat data dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <span className="text-muted-foreground">Tidak ada data untuk ditampilkan.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Guru & Admin</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Buat Kasus Baru
          </Button>
        </div>
      </div>
      
      {/* Area Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pb-4">
        <CalendarDateRangePicker />
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Kelas / Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Level</SelectItem>
            <SelectItem value="level-1">PBL Level 1</SelectItem>
            <SelectItem value="level-2">PBL Level 2</SelectItem>
            <SelectItem value="level-3">PBL Level 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <OverviewCards data={data.overview} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
          <SkillMasteryChart data={data.skillMastery} />
        </div>
        <div className="col-span-3 lg:col-span-3">
          <LeaderboardList data={data.leaderboard} />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4">
          <AssessmentBarChart data={data.assessmentScores} />
        </div>
        <div className="col-span-3 lg:col-span-3">
          <SubmissionStatusChart data={data.submissionStatus} />
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        <RecentActivityTable data={data.recentActivities} />
      </div>
    </div>
  );
}
