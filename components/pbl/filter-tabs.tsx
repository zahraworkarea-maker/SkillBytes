'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export interface FilterTabsProps {
  onFilterChange?: (filter: DifficultyFilter) => void;
}

export function FilterTabs({ onFilterChange }: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('all');

  const filters: { label: string; value: DifficultyFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Expert', value: 'expert' },
    { label: 'Master', value: 'master' },
  ];

  const handleFilterChange = (filter: DifficultyFilter) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-right-6 duration-700 delay-150">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={` px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-md transform hover:scale-105 ${
              activeFilter === filter.value
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
