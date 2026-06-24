"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export interface LeaderboardData {
  id: string;
  name: string;
  email: string;
  score: number;
  mastery: string;
  avatarUrl: string;
}

export function LeaderboardList({ data }: { data: LeaderboardData[] }) {
  return (
    <Card className="border-t-4 border-t-yellow-500 shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Siswa Teratas
        </CardTitle>
        <CardDescription>Siswa dengan probabilitas DKT tertinggi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((student, index) => (
            <div key={student.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`font-bold w-6 text-center ${
                  index === 0 ? "text-yellow-500 text-lg" :
                  index === 1 ? "text-slate-400 text-lg" :
                  index === 2 ? "text-amber-600 text-lg" :
                  "text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                <Avatar className="h-9 w-9 border border-slate-100">
                  <AvatarImage src={student.avatarUrl} alt="Avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-700">
                    {student.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium leading-none">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={
                    index === 0 ? "bg-yellow-500 hover:bg-yellow-600 text-white" :
                    index === 1 ? "bg-slate-400 hover:bg-slate-500 text-white" :
                    index === 2 ? "bg-amber-600 hover:bg-amber-700 text-white" :
                    "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }
                >
                  {student.score}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
