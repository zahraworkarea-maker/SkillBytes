import React from 'react';
import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  timeRemaining: number; // in seconds
  status: 'normal' | 'warning' | 'critical';
  formattedTime: string;
}

export function TimerDisplay({ timeRemaining, status, formattedTime }: TimerDisplayProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-300 text-blue-700';
    }
  };

  const getClockColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${getStatusStyles()}`}>
      <Clock className={`w-5 h-5 ${getClockColor()}`} />
      <div className="flex flex-col">
        <span className="text-xs font-medium opacity-75">Waktu Tersisa</span>
        <span className="text-2xl font-bold font-mono">{formattedTime}</span>
      </div>
    </div>
  );
}
