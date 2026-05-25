'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  Clock,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Eye,
} from 'lucide-react';

import {
  assessmentService,
  assessmentAttemptService,
  assessmentResultService,
  assessmentLevelService,
} from '@/lib/api-services';

import { AssessmentDetail, AssessmentLevel, Assessment } from '@/lib/types/assessment.types';
import { AssessmentDetailLoadingSkeleton } from '@/components/ui/loading-skeleton';

interface AssessmentResult {
  id: string;
  user_id: string;
  assessment: {
    id: number;
    slug: string;
    title: string;
    description: string;
    time_limit: number;
    total_questions: number;
  };
  score: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  started_at: string;
  completed_at?: string;
  created_at: string;
}

export default function AssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();

  /**
   * FIX:
   * Next.js App Router kadang slug undefined saat hydration pertama
   */
  const slug = (
    Array.isArray(params.slug)
      ? params.slug[0]
      : params.slug
  ) as string;

  const [assessment, setAssessment] =
    useState<AssessmentDetail | null>(null);

  const [assessmentLoading, setAssessmentLoading] =
    useState(false);

  const [resultsLoading, setResultsLoading] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isStarting, setIsStarting] = useState(false);

  const [userResult, setUserResult] =
    useState<AssessmentResult | null>(null);

  const [allResults, setAllResults] = useState<
    AssessmentResult[]
  >([]);

  const [showAllResults, setShowAllResults] =
    useState(false);

  /**
   * SEQUENTIAL LOCK STATE
   */
  const [isAssessmentLocked, setIsAssessmentLocked] =
    useState(false);

  const [lockedReason, setLockedReason] =
    useState<string | null>(null);

  const [allLevels, setAllLevels] = useState<
    AssessmentLevel[]
  >([]);

  const [completedAssessmentIds, setCompletedAssessmentIds] =
    useState<Set<number>>(new Set());

  /**
   * FETCH ASSESSMENT
   */
  useEffect(() => {
    // Only run when slug is available
    if (!slug || typeof slug !== 'string') {
      console.log('⏳ Waiting for slug:', slug);
      return;
    }

    let isMounted = true;

    const fetchAssessment = async () => {
      try {
        setAssessmentLoading(true);
        setError(null);

        console.log('📖 Fetching assessment:', slug);

        const response =
          await assessmentService.getAssessmentBySlug(slug);

        if (!isMounted) return;

        if (response.success) {
          console.log('✅ Assessment loaded:', response.data.title);
          setAssessment(response.data);
          setError(null);
        } else {
          setError('Gagal mengambil data assessment');
        }
      } catch (err: any) {
        console.error(
          '❌ Error fetching assessment:',
          err
        );

        if (!isMounted) return;

        setError(
          err?.response?.data?.message ||
            'Terjadi kesalahan saat mengambil assessment'
        );
      } finally {
        if (isMounted) {
          setAssessmentLoading(false);
        }
      }
    };

    fetchAssessment();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /**
   * FETCH USER RESULTS
   */
  useEffect(() => {
    // Skip if slug is not available yet
    if (!slug || typeof slug !== 'string') {
      console.log('⏳ Waiting for user results slug:', slug);
      // ✅ JANGAN set loading state di sini - biarkan fetch dimulai saat slug ready
      return;
    }

    let isMounted = true;

    const fetchUserResults = async () => {
      try {
        setResultsLoading(true);

        console.log('📊 Fetching user results untuk slug:', slug);

        const resultsResponse =
          await assessmentResultService.getAllResults(
            1,
            15
          );

        if (!isMounted) return;

        let resultsData = resultsResponse.data;

        /**
         * Handle nested response
         */
        if (
          resultsData &&
          typeof resultsData === 'object' &&
          !Array.isArray(resultsData) &&
          'data' in resultsData
        ) {
          resultsData = resultsData.data;
        }

        if (
          resultsResponse.success &&
          Array.isArray(resultsData)
        ) {
          const filteredResults = resultsData.filter(
            (result: AssessmentResult) =>
              result.assessment?.slug === slug
          );

          console.log('✅ User results loaded:', filteredResults.length);
          setAllResults(filteredResults);

          /**
           * Latest result
           */
          setUserResult(filteredResults[0] || null);
        } else {
          setAllResults([]);
          setUserResult(null);
        }
      } catch (err: any) {
        console.error(
          '❌ Error fetching user results:',
          err
        );

        if (!isMounted) return;

        setAllResults([]);
        setUserResult(null);
      } finally {
        if (isMounted) {
          console.log('✅ Setting resultsLoading to false');
          setResultsLoading(false);
        }
      }
    };

    fetchUserResults();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /**
   * CHECK SEQUENTIAL LOCK
   * Memastikan assessment hanya bisa dikerjakan jika
   * semua assessment sebelumnya dalam level yang sama sudah selesai
   */
  useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      console.log('⏳ Waiting for slug to check lock:', slug);
      return;
    }

    let isMounted = true;

    const checkSequentialLock = async () => {
      try {
        console.log('🔍 Checking sequential lock for:', slug);

        // Fetch all levels with their assessments
        const levelsResponse =
          await assessmentLevelService.getAllAssessmentLevels(1, 100);

        if (!isMounted) return;

        if (!levelsResponse.success) {
          console.error('Failed to fetch levels for lock check');
          return;
        }

        const levels: AssessmentLevel[] = levelsResponse.data;
        setAllLevels(levels);

        // Find which level contains the current assessment
        let currentLevel: AssessmentLevel | null = null;
        let currentAssessment: Assessment | null = null;

        for (const level of levels) {
          const found = level.assessments.find(
            (a) => a.slug === slug
          );
          if (found) {
            currentLevel = level;
            currentAssessment = found;
            break;
          }
        }

        if (!currentLevel || !currentAssessment) {
          console.warn('Could not find current assessment in levels');
          return;
        }

        console.log(
          '📍 Found assessment in level:',
          currentLevel.level_number,
          'Assessment:',
          currentAssessment.title
        );

        // Fetch all user's completed assessments
        const resultsResponse =
          await assessmentResultService.getAllResults(1, 200);

        if (!isMounted) return;

        let resultsData = resultsResponse.data;

        // Handle nested response
        if (
          resultsData &&
          typeof resultsData === 'object' &&
          !Array.isArray(resultsData) &&
          'data' in resultsData
        ) {
          resultsData = resultsData.data;
        }

        // Build set of completed assessment IDs
        const completed = new Set<number>();

        if (Array.isArray(resultsData)) {
          resultsData.forEach((r: any) => {
            const status = r.status;
            if (status === 'COMPLETED') {
              const assessmentId =
                r.assessment?.id || r.assessment_id;
              if (assessmentId) completed.add(Number(assessmentId));
            }
          });
        }

        setCompletedAssessmentIds(completed);

        console.log(
          '✅ Completed assessments:',
          Array.from(completed)
        );

        // Sort assessments in current level by ID to determine sequence
        const sortedAssessments = [
          ...currentLevel.assessments,
        ].sort((a, b) => a.id - b.id);

        const currentIndex = sortedAssessments.findIndex(
          (a) => a.id === currentAssessment.id
        );

        console.log(
          `📋 Current assessment index: ${currentIndex} of ${sortedAssessments.length}`
        );

        // Check if all previous assessments are completed
        let isLocked = false;
        let reason: string | null = null;

        if (currentIndex > 0) {
          for (let i = 0; i < currentIndex; i++) {
            const previousAssessment = sortedAssessments[i];

            if (!completed.has(previousAssessment.id)) {
              isLocked = true;
              reason = `Anda harus menyelesaikan "${previousAssessment.title}" terlebih dahulu sebelum mengerjakan assessment ini.`;
              console.log('🔒 Assessment is locked:', reason);
              break;
            }
          }
        }

        if (!isMounted) return;

        setIsAssessmentLocked(isLocked);
        setLockedReason(reason);

        console.log(
          isLocked ? '🔒 Assessment LOCKED' : '🔓 Assessment UNLOCKED'
        );
      } catch (err: any) {
        console.error(
          '❌ Error checking sequential lock:',
          err
        );

        if (!isMounted) return;

        setIsAssessmentLocked(false);
        setLockedReason(null);
      }
    };

    checkSequentialLock();

    return () => {
      isMounted = false;
    };
  }, [slug, allResults]);

  /**
   * START / CONTINUE ASSESSMENT
   */
  const handleStartAssessment = async () => {
    if (!assessment) return;

    /**
     * CHECK IF ASSESSMENT IS LOCKED
     */
    if (isAssessmentLocked) {
      setError(lockedReason || 'Assessment ini terkunci. Selesaikan assessment sebelumnya terlebih dahulu.');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);

      console.log(
        '🚀 Checking active attempt:',
        assessment.id
      );

      /**
       * CHECK ACTIVE ATTEMPT
       */
      const activeAttemptRes =
        await assessmentResultService.getActiveAttemptBySlug(
          slug
        );

      if (
        activeAttemptRes.success &&
        activeAttemptRes.data
      ) {
        const activeAttempt = activeAttemptRes.data;

        if (activeAttempt.status === 'IN_PROGRESS') {
          console.log(
            '✅ Found active attempt:',
            activeAttempt.id
          );

          router.push(
            `/assesmen/${slug}/quiz?attemptId=${activeAttempt.id}`
          );

          return;
        }
      }

      /**
       * CREATE NEW ATTEMPT
       */
      const startResponse =
        await assessmentAttemptService.startAssessment(
          assessment.id
        );

      if (
        startResponse.success &&
        startResponse.data?.attempt_id
      ) {
        console.log(
          '✅ New attempt created:',
          startResponse.data.attempt_id
        );

        router.push(
          `/assesmen/${slug}/quiz?attemptId=${startResponse.data.attempt_id}`
        );
      } else {
        setError(
          startResponse.message ||
            'Anda sudah siap?'
        );
      }
    } catch (err: any) {
      console.error(
        '❌ Error starting assessment:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Anda sudah siap?'
      );
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * VIEW RESULT
   */
  const handleViewResult = (resultId: string) => {
    router.push(
      `/assesmen/${slug}/hasil?attemptId=${resultId}`
    );
  };

  /**
   * LOADING STATE - Show skeleton while fetching assessment
   */
  if (assessmentLoading && !assessment) {
    return <AssessmentDetailLoadingSkeleton />;
  }

  /**
   * ERROR
   */
  if (error && assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Anda sudah siap?
          </h1>

          <p className="text-gray-600 mb-6">
            Tekan tombol start jika sudah siap
          </p>

          <button
            onClick={() => router.push('/assesmen')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.push('/assesmen')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Assessment
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* HEADER */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {assessmentLoading || !assessment ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3"></div>
                ) : (
                  assessment.title
                )}
              </h1>

              <div className="text-lg text-gray-600 leading-relaxed">
                {assessmentLoading || !assessment ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  </div>
                ) : (
                  assessment.description
                )}
              </div>
            </div>

            {/* USER RESULT */}
            {resultsLoading ? (
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                </div>
              </div>
            ) : userResult ? (
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hasil Assessment
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      userResult.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {userResult.status === 'COMPLETED'
                      ? 'Selesai'
                      : 'Sedang Dikerjakan'}
                  </span>
                </div>

                {/* SCORE */}
                {userResult.status === 'COMPLETED' && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-12 h-12 text-green-600" />

                      <div>
                        <p className="text-sm text-gray-600">
                          Skor Anda
                        </p>

                        <p className="text-4xl font-bold text-green-600">
                          {userResult.score}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TIMELINE */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-1 bg-blue-500 rounded-full flex-shrink-0"></div>

                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wider">
                        Dimulai
                      </p>

                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(
                          userResult.started_at
                        ).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {userResult.status ===
                    'COMPLETED' &&
                    userResult.completed_at && (
                      <div className="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="w-1 bg-green-500 rounded-full flex-shrink-0"></div>

                        <div>
                          <p className="text-xs text-gray-600 uppercase tracking-wider">
                            Selesai
                          </p>

                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(
                              userResult.completed_at
                            ).toLocaleString(
                              'id-ID'
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* VIEW DETAIL */}
                {userResult.status === 'COMPLETED' && (
                  <button
                    onClick={() =>
                      handleViewResult(userResult.id)
                    }
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Lihat Detail Jawaban
                  </button>
                )}
              </div>
            ) : null}

            {/* ATTEMPT HISTORY */}
            {allResults.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <button
                  onClick={() =>
                    setShowAllResults(
                      !showAllResults
                    )
                  }
                  className="w-full flex items-center justify-between mb-6 hover:opacity-75 transition-opacity"
                >
                  <h3 className="text-lg font-bold text-gray-900">
                    Riwayat Attempt (
                    {allResults.length})
                  </h3>

                  <ChevronRight
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      showAllResults
                        ? 'rotate-90'
                        : ''
                    }`}
                  />
                </button>

                {showAllResults && (
                  <div className="space-y-3">
                    {allResults.map(
                      (result, index) => (
                        <div
                          key={result.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Attempt{' '}
                              {index + 1}
                            </p>

                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(
                                result.created_at
                              ).toLocaleString(
                                'id-ID',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute:
                                    '2-digit',
                                }
                              )}
                            </p>

                            {result.status ===
                              'COMPLETED' && (
                              <p className="text-lg font-bold text-green-600 mt-1">
                                Skor:{' '}
                                {result.score}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                result.status ===
                                'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {result.status ===
                              'COMPLETED'
                                ? 'Selesai'
                                : 'Berlangsung'}
                            </span>

                            {result.status ===
                              'COMPLETED' && (
                              <button
                                onClick={() =>
                                  handleViewResult(
                                    result.id
                                  )
                                }
                                className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Lihat
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-8 space-y-6">
              {/* INFO */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />

                  <div>
                    <p className="text-sm text-gray-600">
                      Batas Waktu
                    </p>

                    <div className="text-lg font-bold text-gray-900">
                      {assessmentLoading || !assessment ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                      ) : (
                        <>
                          {assessment.time_limit-5}{' '}
                          Menit
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />

                  <div>
                    <p className="text-sm text-gray-600">
                      Total Soal
                    </p>

                    <div className="text-lg font-bold text-gray-900">
                      {assessmentLoading || !assessment ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                      ) : (
                        <>
                          {
                            assessment.total_questions
                          }{' '}
                          Soal
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* TIPS */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">
                    Tips:
                  </span>{' '}
                  Pastikan Anda memiliki waktu
                  yang cukup dan koneksi
                  internet yang stabil sebelum
                  memulai.
                </p>
              </div>

              {/* LOCK MESSAGE */}
              {isAssessmentLocked && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">
                    {lockedReason || 'Assessment ini terkunci. Selesaikan assessment sebelumnya terlebih dahulu.'}
                  </p>
                </div>
              )}

              {/* BUTTON */}
              {userResult?.status !==
                'COMPLETED' && (
                <button
                  onClick={
                    handleStartAssessment
                  }
                  disabled={
                    isStarting ||
                    resultsLoading ||
                    isAssessmentLocked
                  }
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isStarting ||
                  resultsLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                      {userResult?.status ===
                      'IN_PROGRESS'
                        ? 'Melanjutkan...'
                        : 'Memulai...'}
                    </>
                  ) : (
                    <>
                      {userResult?.status ===
                      'IN_PROGRESS'
                        ? 'Lanjutkan'
                        : 'Mulai'}

                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}

              {/* FOOTER */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-600 text-center">
                  {assessmentLoading || !assessment ? (
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <>
                      Anda akan diberi waktu{' '}
                      {assessment.time_limit-5}{' '}
                      menit untuk menjawab semua
                      soal. Pertanyaan tidak dapat
                      dilewati.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}