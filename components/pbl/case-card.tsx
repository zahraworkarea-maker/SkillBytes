'use client';

import { Lock, Search, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export interface CaseCardProps {
  id: string;
  level: number;
  difficulty: string;
  caseNumber: number;
  title?: string;
  status?: string;
  statusLabel?: string;
  unlockCondition?: string;
  caseStatus: 'complete' | 'available' | 'locked';
  illustration?: React.ReactNode;
  difficultyColor?: string;
  onClick?: () => void;
}

// Level Configuration - All color and difficulty settings
export const levelConfig: Record<number, { difficulty: string; gradientColor: string; badgeColor: string }> = {
  1: { 
    difficulty: 'Beginner', 
    gradientColor: 'from-cyan-300 to-cyan-50',
    badgeColor: 'bg-cyan-400 text-white',
  },
  4: { 
    difficulty: 'Expert', 
    gradientColor: 'from-purple-300 to-purple-50',
    badgeColor: 'bg-purple-400 text-white',
  },
  3: { 
    difficulty: 'Advanced',
    gradientColor: 'from-amber-200 to-amber-50',
    badgeColor: 'bg-amber-500 text-white',
  },
  2: { 
    difficulty: 'Intermediate', 
    gradientColor: 'from-[#b4f7c2] to-white',
    badgeColor: 'bg-green-400 text-white',
  },
  5: { 
    difficulty: 'Master', 
    gradientColor: 'from-[#e98aa3] to-pink-100',
    badgeColor: 'bg-pink-500 text-white',
  },
};

export function CaseCard({
  id,
  level,
  difficulty,
  caseNumber,
  title,
  status,
  statusLabel,
  unlockCondition,
  caseStatus,
  difficultyColor,
  onClick,
}: CaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = levelConfig[level];
  const bgGradient = difficultyColor || config.gradientColor || 'from-cyan-300 to-cyan-50';
  const badgeColor = config.badgeColor || 'bg-cyan-400 text-white';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl md:rounded-3xl shadow-md md:shadow-lg transition-all duration-500 cursor-pointer bg-gradient-to-r ${bgGradient} min-h-[280px] sm:min-h-[300px] md:min-h-[330px] ${
        isHovered ? 'shadow-lg md:shadow-2xl md:-translate-y-2' : 'hover:shadow-md md:hover:shadow-xl'
      } animate-in fade-in slide-in-from-bottom-6 duration-500`}
      style={{
        animationDelay: `${Math.random() * 300}ms`,
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col h-full">
        {/* Level Badge */}
        <div className="mb-3 sm:mb-4">
          <span className={`inline-block ${badgeColor} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-xs font-bold`}>
            Level {level} • {difficulty}
          </span>
        </div>

        {/* Case Info Section */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">

            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{title || `Case #${caseNumber}`}</span>
          </div>
        </div>

        {/* Illustration Section - Design area only */}
        <div className="flex-1 flex items-center justify-center min-h-16 sm:min-h-20">
        </div>
      </div>

      {/* BOTTOM SECTION - White Semi-transparent OVERLAY */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/75 backdrop-blur-md rounded-t-2xl md:rounded-t-3xl p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-2 sm:gap-3 min-h-[130px] sm:min-h-[140px] md:min-h-[150px] justify-between">
        {/* Status or Unlock Section */}
        <div className="space-y-2 sm:space-y-3">
          {status && statusLabel && (
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${caseStatus === 'locked' ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                {statusLabel}: {status}
              </span>
            </div>
          )}

          {unlockCondition && (
            <p className="text-xs sm:text-xs font-medium text-slate-600">
              {caseStatus === 'complete' ? (
                <>
                  <CheckCircle className="inline-block mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                  {unlockCondition}
                </>
              ) : caseStatus === 'locked' ? (
                <>
                  <Lock className="inline-block mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                  {unlockCondition}
                </>
              ) : (
                <>{unlockCondition}</>
              )}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {caseStatus === 'locked' ? (
            <button
              disabled
              className="w-full py-2 sm:py-2 md:py-2 bg-slate-300/60 text-slate-600 rounded-lg font-semibold text-xs sm:text-sm cursor-not-allowed opacity-70 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-slate-300/70"
            >
              <Lock size={16} />
              Terkunci
            </button>
          ) : caseStatus === 'complete' ? (
            <button
              className="w-full py-2 sm:py-2 md:py-3 bg-green-400 text-white rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Search size={16} className="sm:w-4 sm:h-4" />
              View Result
            </button>
          ) : (
            <button
              className="w-full py-2 sm:py-2 md:py-3 bg-cyan-400 text-white rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Search size={16} className="sm:w-4 sm:h-4" />
              Mulai Investigasi 🔍
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
