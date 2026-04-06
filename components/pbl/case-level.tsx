'use client';

import { CaseCard, type CaseCardProps } from './case-card';

export interface CaseLevelProps {
  levelTitle: string;
  cases: CaseCardProps[];
}

export function CaseLevel({ levelTitle, cases }: CaseLevelProps) {
  return (
    <div className="mb-10">
      <div className="mb-4 animate-in fade-in slide-in-from-left-6 duration-500">
        <h3 className="text-lg font-bold text-slate-800">{levelTitle}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cases.map((caseItem) => (
          <CaseCard
            key={`${caseItem.level}-${caseItem.caseNumber}`}
            {...caseItem}
          />
        ))}
      </div>
    </div>
  );
}
