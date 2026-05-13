'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PBLHeader } from './pbl-header';
import { ProgressSection } from './progress-section';
import { FilterTabs, type DifficultyFilter } from './filter-tabs';
import { CaseCard, type CaseCardProps, levelConfig } from './case-card';
import { pblService } from '@/lib/api-services';

// Map difficulty level to numeric level
const difficultyToLevel: Record<string, number> = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Expert': 4,
  'Master': 5,
};

// Build cases from backend response
const buildCasesFromBackend = (backendData: any[]) => {
  return backendData.map((pblCase: any, index: number) => {
    // Map pbl_level.name to numeric level
    const levelName = pblCase.pbl_level?.name || 'Beginner';
    const level = difficultyToLevel[levelName] || 1;
    const isCompleted = pblCase.status === 'completed';

    return {
      id: pblCase.id,
      level,
      caseNumber: pblCase.case_number,
      title: pblCase.title,
      isCompleted,
      index,
      status: pblCase.status,
      slug: pblCase.slug,
      description: pblCase.description,
      timeLimit: pblCase.time_limit,
      startDate: pblCase.start_date,
      deadline: pblCase.deadline,
    };
  });
};

// Build cases with auto-locked logic
const buildAllCases = (rawCases: any[], router: any): CaseCardProps[] => {
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
        ? () => router.push(`/pbl/${rawCase.slug}`)
        : undefined,
    };
  });
};

interface RawCaseData {
  id: string | number;
  level: number;
  caseNumber: number;
  title: string;
  isCompleted?: boolean;
  index?: number;
}

interface PBLResponse {
  current_page: number;
  data: any[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{url: string | null, label: string, active: boolean}>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export function PBLContent() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<DifficultyFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawCases, setRawCases] = useState<RawCaseData[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<Partial<PBLResponse>>({});

  // Fetch PBL cases from backend on component mount
  useEffect(() => {
    const fetchPBLCases = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[PBL CONTENT] Fetching PBL cases from backend...');
        
        const response: PBLResponse = await pblService.getAllCases(1, 15);
        console.log('[PBL CONTENT] Response received:', response);
        
        // Store pagination info
        setPaginationInfo({
          current_page: response.current_page,
          from: response.from,
          last_page: response.last_page,
          to: response.to,
          total: response.total,
          per_page: response.per_page,
          first_page_url: response.first_page_url,
          last_page_url: response.last_page_url,
          next_page_url: response.next_page_url,
          prev_page_url: response.prev_page_url,
          links: response.links,
        });

        // Transform backend response to internal format
        const transformedCases = buildCasesFromBackend(response.data);
        setRawCases(transformedCases);
        console.log('[PBL CONTENT] Cases loaded:', transformedCases);
      } catch (err: any) {
        console.error('[PBL CONTENT] Error fetching PBL cases:', err);
        setError(err.message || 'Gagal mengambil data PBL cases');
      } finally {
        setLoading(false);
      }
    };

    fetchPBLCases();
  }, []);
  
  const allCases = useMemo(() => buildAllCases(rawCases, router), [rawCases, router]);

  const filteredCases = useMemo(() => {
    if (activeFilter === 'all') {
      return allCases;
    }

    return allCases.filter(
      (caseItem) => caseItem.difficulty.toLowerCase() === activeFilter
    );
  }, [activeFilter, allCases]);

  const completedCount = rawCases.filter((c) => c.isCompleted).length;

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PBL cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PBLHeader />
      <ProgressSection 
        completed={completedCount} 
        total={allCases.length} 
        percentage={Math.round((completedCount / allCases.length) * 100 || 0)} 
      />
      <FilterTabs onFilterChange={setActiveFilter} />

      {/* Pagination Info */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {paginationInfo.from} to {paginationInfo.to} of {paginationInfo.total} cases (Page {paginationInfo.current_page} of {paginationInfo.last_page})
      </div>

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
