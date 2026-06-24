"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ActivityData {
  id: string;
  studentName: string;
  activity: string;
  caseTitle: string;
  status: string;
  time: string;
}

export function RecentActivityTable({ data }: { data: ActivityData[] }) {
  return (
    <Card className="border-t-4 border-t-emerald-500 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-emerald-700">Aktivitas Terbaru Siswa</CardTitle>
        <CardDescription>
          Daftar pengumpulan kasus PBL dan hasil kuis terbaru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Siswa</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Materi / Kasus</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Waktu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.studentName}</TableCell>
                <TableCell>{activity.activity}</TableCell>
                <TableCell>{activity.caseTitle}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      activity.status === "Completed" || activity.status === "Reviewed" 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                        : activity.status === "Failed" 
                        ? "bg-rose-500 hover:bg-rose-600 text-white" 
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }
                  >
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {activity.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
