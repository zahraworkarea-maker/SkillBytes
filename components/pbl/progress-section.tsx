'use client';

export interface ProgressSectionProps {
  completed?: number;
  total?: number;
  percentage?: number;
}

export function ProgressSection({
  completed = 3,
  total = 5,
  percentage = 60,
}: ProgressSectionProps) {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Progress Kamu:
            </span>
            <span className="text-sm font-bold text-blue-600">{percentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {completed} dari {total} Case selesai
          </p>
        </div>
      </div>
    </div>
  );
}
