'use client';

import { useState, useMemo } from 'react';
import { PBLHeader } from './pbl-header';
import { ProgressSection } from './progress-section';
import { FilterTabs, type DifficultyFilter } from './filter-tabs';
import { CaseCard, type CaseCardProps, levelConfig } from './case-card';

// Raw case data without difficulty/color (will be auto-set)
interface RawCaseData {
  id: string;
  level: number;
  caseNumber: number;
  title: string;
  status?: string;
  statusLabel?: string;
  isCompleted?: boolean;
}

const rawCases: RawCaseData[] = [
  {
    id: 'case-01',
    level: 1,
    caseNumber: 1,
    title: 'PBL : Investigation 1',
    isCompleted: true,
  },
  {
    id: 'case-02',
    level: 2,
    caseNumber: 2,
    title: 'Case #2',
    isCompleted: true,
  },
  {
    id: 'case-03',
    level: 3,
    caseNumber: 3,
    title: 'Case #3',
    isCompleted: false,
  },
  {
    id: 'case-04',
    level: 4,
    caseNumber: 4,
    title: 'Case #4',
    isCompleted: false,
  },
  {
    id: 'case-05',
    level: 5,
    caseNumber: 5,
    title: 'Case #5',
    isCompleted: false,
  },
];

// Build cases with auto-locked logic
const allCases: CaseCardProps[] = rawCases.map((rawCase, index) => {
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
  };
});

export function PBLContent() {
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('all');

  const filteredCases = useMemo(() => {
    if (activeFilter === 'all') {
      return allCases;
    }

    return allCases.filter(
      (caseItem) => caseItem.difficulty.toLowerCase() === activeFilter
    );
  }, [activeFilter]);

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
