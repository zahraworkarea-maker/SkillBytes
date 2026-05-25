'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle, Clock, BookOpen, Lock, CheckCircle, Zap, Target, Trophy, Code } from 'lucide-react';
import { assessmentLevelService, assessmentResultService } from '@/lib/api-services';
import { Assessment, AssessmentLevel } from '@/lib/types/assessment.types';
import { AssessmentListLoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [assessmentLevels, setAssessmentLevels] = useState<AssessmentLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<Set<number>>(new Set());

  // Fetch assessment levels with assessments
  useEffect(() => {
    const fetchAssessmentLevels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await assessmentLevelService.getAllAssessmentLevels(
          1,
          100
        );
        
        if (response.success) {
          setAssessmentLevels(response.data);

          // Fetch user's completed assessment results to determine unlocked levels
          try {
            const resultsRes = await assessmentResultService.getAllResults(1, 200);
            let resultsData: any = resultsRes.data;

            // Handle nested response shape
            if (
              resultsData &&
              typeof resultsData === 'object' &&
              !Array.isArray(resultsData) &&
              'data' in resultsData
            ) {
              resultsData = resultsData.data;
            }

            if (resultsRes.success && Array.isArray(resultsData)) {
              const completed = new Set<number>();

              resultsData.forEach((r: any) => {
                const status = r.status || r?.status;
                if (status === 'COMPLETED') {
                  const assessmentId = r.assessment?.id || r.assessment_id || r.assessment?.assessment_id;
                  if (assessmentId) completed.add(Number(assessmentId));
                }
              });

              setCompletedAssessments(completed);
            }
          } catch (err) {
            // Non-fatal: keep existing state but log for debugging
            console.error('Error fetching user results for unlocking levels:', err);
          }

        } else {
          setError('Gagal mengambil data assessment level');
        }
      } catch (err: any) {
        console.error('Error fetching assessment levels:', err);
        setError(
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil data assessment'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentLevels();
  }, []);

  const handleStartAssessment = (assessment: Assessment) => {
    router.push(`/assesmen/${assessment.slug}`);
  };

  // Determine if an assessment card should be locked
  const isAssessmentLocked = (levelNumber: number): boolean => {
    if (levelNumber === 1) return false; // Level 1 is always unlocked
    
    // Level 2 is locked until all level 1 assessments are completed
    if (levelNumber === 2) {
      const level1 = assessmentLevels.find(l => l.level_number === 1);
      if (!level1) return true;
      return !level1.assessments.every(assessment => 
        completedAssessments.has(assessment.id)
      );
    }
    
    // Level 3+ is locked until all previous levels are completed
    for (let i = 1; i < levelNumber; i++) {
      const previousLevel = assessmentLevels.find(l => l.level_number === i);
      if (!previousLevel) return true;
      if (!previousLevel.assessments.every(assessment => 
        completedAssessments.has(assessment.id)
      )) {
        return true;
      }
    }
    
    return false;
  };

  /**
   * Check if a specific assessment is locked due to sequential ordering within its level
   */
  const isAssessmentSequentiallyLocked = (assessment: Assessment, level: AssessmentLevel): boolean => {
    if (isAssessmentLocked(level.level_number)) {
      return true; // Entire level is locked
    }

    // Sort assessments in level by ID to determine sequence
    const sortedAssessments = [...level.assessments].sort((a, b) => a.id - b.id);
    const currentIndex = sortedAssessments.findIndex(a => a.id === assessment.id);

    // Check if all previous assessments in the same level are completed
    if (currentIndex > 0) {
      for (let i = 0; i < currentIndex; i++) {
        if (!completedAssessments.has(sortedAssessments[i].id)) {
          return true; // Previous assessment not completed
        }
      }
    }

    return false;
  };



  if (loading) {
    return <AssessmentListLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Skill Competency Assessment</h1>
          <p className="text-lg text-slate-600">
            Evaluasi pemahaman Anda melalui tes yang terstruktur
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Assessment Levels Sections */}
        {assessmentLevels.length > 0 ? (
          <div className="space-y-8">
            {assessmentLevels.map((level) => {
              return (
                <div key={level.id} className="bg-white rounded-xl shadow-sm border border-slate-200 transition-all duration-300 p-6 hover:shadow-md">
                  {/* Level Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-black-600">
                      LEVEL {level.level_number} - {level.description}
                    </h2>
                  </div>

                  {/* Assessment Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {level.assessments.map((assessment) => (
                      <AssessmentCard
                        key={assessment.id}
                        assessment={assessment}
                        isLocked={isAssessmentSequentiallyLocked(assessment, level)}
                        isCompleted={completedAssessments.has(assessment.id)}
                        onStart={handleStartAssessment}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-4">
              <AlertCircle className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-900 text-lg font-semibold mt-4">
              Tidak ada assessment tersedia saat ini
            </p>
            <p className="text-slate-500 text-sm mt-2">Silakan tunggu assessment baru</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Modern Assessment Card Component
interface AssessmentCardProps {
  assessment: Assessment;
  isLocked: boolean;
  isCompleted: boolean;
  onStart: (assessment: Assessment) => void;
}

// Define gradient and icon mapping for different assessment types
const getAssessmentStyle = (index: number) => {
  const styles = [
    { gradient: 'from-blue-500 to-cyan-500', icon: Code, bgLight: 'bg-blue-50' },
    { gradient: 'from-purple-500 to-pink-500', icon: Target, bgLight: 'bg-purple-50' },
    { gradient: 'from-green-500 to-emerald-500', icon: Zap, bgLight: 'bg-green-50' },
    { gradient: 'from-orange-500 to-red-500', icon: Trophy, bgLight: 'bg-orange-50' },
    { gradient: 'from-indigo-500 to-blue-500', icon: BookOpen, bgLight: 'bg-indigo-50' },
    { gradient: 'from-rose-500 to-pink-500', icon: CheckCircle, bgLight: 'bg-rose-50' },
  ];
  return styles[index % styles.length];
};

function AssessmentCard({ assessment, isLocked, isCompleted, onStart }: AssessmentCardProps) {
  // Fix: Convert time_limit from seconds to minutes (ensure proper calculation)
  const timeInMinutes = assessment.time_limit > 0 
    ? assessment.time_limit >= 60 
      ? Math.ceil((assessment.time_limit - 5) / 60) 
      : assessment.time_limit - 5
    : 0;
  
  const [isHovered, setIsHovered] = useState(false);
  const style = getAssessmentStyle(assessment.id % 6);
  const Icon = style.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 h-full flex flex-col cursor-pointer backdrop-blur-md bg-slate-200/10 border border-slate-400/20 hover:border-slate-300/40 hover:bg-slate-500/15 ${
        isLocked ? 'opacity-60 hover:opacity-75' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Header - Compact */}
      <div className="relative px-4 py-3 border-b border-slate-400/10 backdrop-blur-sm bg-slate-400/5">
        <div className="flex items-center justify-between gap-2">
          {/* Icon */}
          <div className="p-2 rounded-lg flex-shrink-0 bg-slate-400/20">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
          
          {/* Title - Make it prominent */}
          <h3 className="text-sm font-bold flex-1 line-clamp-1 text-slate-800">
            {assessment.title}
          </h3>
          
          {/* Status Indicator */}
          {isCompleted && !isLocked && (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
          {isLocked && (
            <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Content Section - More Compact */}
      <div className="relative flex-1 px-4 py-3 flex flex-col backdrop-blur-sm">
        
        {/* Description - Optional, only show 1 line */}
        {assessment.description && (
          <p className="text-xs line-clamp-1 mb-2 text-slate-700">
            {assessment.description}
          </p>
        )}

        {/* Stats Row - Inline and Compact */}
        <div className="flex items-center justify-between gap-3 mb-3 py-2 px-2 rounded-lg bg-slate-400/10 border border-slate-400/10">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 flex-shrink-0 text-slate-600" />
            <div>
              <p className="text-xs text-slate-600">Soal</p>
              <p className="text-sm font-bold text-slate-800">
                {assessment.total_questions}
              </p>
            </div>
          </div>
          
          <div className="w-px h-6 bg-slate-400/20"></div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 flex-shrink-0 text-slate-600" />
            <div>
              <p className="text-xs text-slate-600">Waktu</p>
              <p className="text-sm font-bold text-slate-800">
                {timeInMinutes}m
              </p>
            </div>
          </div>
        </div>

        {/* Status Badge & Button */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <div className="text-center">
            {isCompleted && !isLocked && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-green-500/20 text-green-700 text-xs font-bold border border-green-400/40 backdrop-blur-sm">
                ✓ SELESAI
              </span>
            )}
            {!isCompleted && !isLocked && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-700 text-xs font-bold border border-blue-400/40 backdrop-blur-sm">
                TERSEDIA
              </span>
            )}
            {isLocked && (
              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-400/20 text-slate-700 text-xs font-bold border border-slate-400/40 backdrop-blur-sm">
                TERKUNCI
              </span>
            )}
          </div>
          
          {!isLocked && (
            <button
              onClick={() => onStart(assessment)}
              className={`w-full py-2 rounded-lg font-bold text-xs transition-all duration-300 transform backdrop-blur-sm ${
                isCompleted
                  ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30 border border-green-400/40 hover:scale-105 active:scale-95'
                  : 'bg-blue-400/80 text-white hover:bg-blue-500 border border-blue-400/40 hover:scale-105 active:scale-95'
              }`}
            >
              {isCompleted ? 'Lihat Hasil' : 'Mulai'}
            </button>
          )}
          {isLocked && (
            <button
              disabled
              className="w-full py-2 rounded-lg font-bold text-xs bg-slate-400/15 text-slate-500 cursor-not-allowed border border-slate-400/20 backdrop-blur-sm"
            >
              Terkunci
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
