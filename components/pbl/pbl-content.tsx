'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PBLHeader } from './pbl-header';
import { ProgressSection } from './progress-section';
import { FilterTabs, type DifficultyFilter } from './filter-tabs';
import { CaseCard, type CaseCardProps, levelConfig } from './case-card';
import { pblCasesData } from '@/lib/pbl-data';

// Map difficulty level to numeric level
const difficultyToLevel: Record<string, number> = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Expert': 4,
  'Master': 5,
};

// Build cases from pbl-data.ts
const buildCasesFromData = () => {
  return Object.values(pblCasesData).map((pblCase, index) => {
    const level = difficultyToLevel[pblCase.level] || 1;
    const isCompleted = pblCase.isCompleted || pblCase.status === 'completed';

    return {
      id: pblCase.id,
      level,
      caseNumber: pblCase.caseNumber,
      title: pblCase.title,
      isCompleted,
      index,
    };
  });
};

const rawCases = buildCasesFromData();

// Build cases with auto-locked logic
const buildAllCases = (router: any): CaseCardProps[] => {
  return rawCases.map((rawCase, index) => {
    const config = levelConfig[rawCase.level];
    const previousRawCase = index > 0 ? rawCases[index - 1] : null;
    const previousLevelCompleted = rawCase.level === 1 || (previousRawCase?.isCompleted ?? false);
    const isCompleted = rawCase.isCompleted ?? false;

    // Determine case status: complete, available, or locked
    let caseStatus: 'complete' | 'available' | 'locked';
    if (isCompleted) {
      caseStatus = 'complete';
    } else if (previousLevelCompleted) {
      caseStatus = 'available';
    } else {
      caseStatus = 'locked';
    }

    // Auto generate status text based on caseStatus
    const statusMap = {
      complete: 'Complete',
      available: 'Available',
      locked: 'Locked',
    };

    return {
      id: rawCase.id,
      level: rawCase.level,
      difficulty: config.difficulty,
      caseNumber: rawCase.caseNumber,
      title: rawCase.title,
      status: statusMap[caseStatus],
      statusLabel: 'Status',
      unlockCondition: caseStatus === 'locked' 
        ? `Complete Level ${rawCase.level - 1}` 
        : undefined,
      caseStatus: caseStatus,
      difficultyColor: config.gradientColor,
      onClick: caseStatus !== 'locked' 
        ? () => router.push(`/pbl/${rawCase.id}`)
        : undefined,
    };
  });
};

interface RawCaseData {
  id: string;
  level: number;
  caseNumber: number;
  title: string;
  isCompleted?: boolean;
  index?: number;
}

export function PBLContent() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('all');
  
  const allCases = useMemo(() => buildAllCases(router), [router]);

  const filteredCases = useMemo(() => {
    if (activeFilter === 'all') {
      return allCases;
    }

    return allCases.filter(
      (caseItem) => caseItem.difficulty.toLowerCase() === activeFilter
    );
  }, [activeFilter, allCases]);

  const completedCount = rawCases.filter((c) => c.isCompleted).length;

  return (
    <div className="w-full">
      <PBLHeader />
      <ProgressSection 
        completed={completedCount} 
        total={allCases.length} 
        percentage={Math.round((completedCount / allCases.length) * 100)} 
      />
      <FilterTabs onFilterChange={setActiveFilter} />

      {/* Cases Grid - 2-1 pattern on mobile, 3-2 pattern on desktop, stretch items to fill row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full justify-items-stretch">
        {filteredCases.map((caseItem) => (
          <div key={caseItem.id}>
            <CaseCard {...caseItem} />
          </div>
        ))}
      </div>
    </div>
  );
}
