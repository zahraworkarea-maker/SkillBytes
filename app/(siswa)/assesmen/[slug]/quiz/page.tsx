'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader, AlertCircle, ChevronLeft, ChevronRight, Flag, CheckCircle2 } from 'lucide-react';
import { assessmentService, assessmentAttemptService, assessmentResultService } from '@/lib/api-services';
import { AssessmentDetail } from '@/lib/types/assessment.types';
import { useAssessmentTimer } from '@/hooks/use-assessment-timer';
import { useAssessmentState } from '@/hooks/use-assessment-state';
import { TimerDisplay, QuestionProgress, QuizQuestion } from '@/components/assesmen';

// Error Boundary Component
class AssessmentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('❌ Error Boundary caught error:', error);
    // Auto reload setelah 2 detik
    setTimeout(() => {
      console.log('🔄 Auto reloading due to error...');
      window.location.reload();
    }, 2000);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 text-red-600 animate-spin" />
            <p className="text-gray-600">Terjadi kesalahan, sedang melakukan reload...</p>
            <p className="text-sm text-gray-500">(Tunggu beberapa detik)</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper functions for localStorage
const STORAGE_KEY_PREFIX = 'assessment_answers_';

const saveAnswersToStorage = (attemptId: number, answers: Record<number | string, number | string>) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${attemptId}`, JSON.stringify(answers));
    console.log(`💾 Answers saved to localStorage for attempt ${attemptId}`);
  } catch (err) {
    console.error('❌ Failed to save answers to localStorage:', err);
  }
};

const loadAnswersFromStorage = (attemptId: number): Record<number | string, number | string> | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${attemptId}`);
    if (stored) {
      const answers = JSON.parse(stored);
      console.log(`📖 Answers loaded from localStorage for attempt ${attemptId}:`, answers);
      return answers;
    }
    return null;
  } catch (err) {
    console.error('❌ Failed to load answers from localStorage:', err);
    return null;
  }
};

const clearAnswersFromStorage = (attemptId: number) => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${attemptId}`);
    console.log(`🗑️ Answers cleared from localStorage for attempt ${attemptId}`);
  } catch (err) {
    console.error('❌ Failed to clear answers from localStorage:', err);
  }
};

function AssessmentQuizContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const attemptIdParam = searchParams.get('attemptId');

  // Track if initialization has been done (prevent multiple calls)
  const initializationAttempted = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // State
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  const [isFinishingAssessment, setIsFinishingAssessment] = useState(false);
  const [resumedFromActive, setResumedFromActive] = useState(false);
  const [dataReady, setDataReady] = useState(false); // Track when all data is ready

  console.log('🏠 [COMPONENT] AssessmentQuizPage mounted, slug:', slug, 'attemptIdParam:', attemptIdParam);

  // Hooks
  const timer = useAssessmentTimer({
    initialTimeLimit: 15, // Will be updated when assessment loads
    onTimeUp: async () => {
      // Auto-finish when time is up
      if (attemptId) {
        await handleFinishAssessment(true);
      }
    },
  });

  const assessmentState = useAssessmentState({
    totalQuestions: 5, // Will be updated when assessment loads
  });

  // Initialize assessment - get assessment detail and verify attempt exists
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationAttempted.current) {
      console.log('⚠️ Initialization already attempted, skipping...');
      return;
    }

    initializationAttempted.current = true;

    // Create abort controller for this initialization
    const controller = new AbortController();
    abortController.current = controller;

    const initializeAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        setDataReady(false); // Reset data ready state
        console.log('🔄 Starting initialization...');
        
        // Step 1: Get assessment detail by slug (always needed)
        console.log('📖 Step 1: Fetching assessment detail from slug:', slug);
        const assessmentRes = await assessmentService.getAssessmentBySlug(slug);
        console.log('📖 Assessment response status:', assessmentRes.success ? '200 OK' : 'FAILED');
        console.log('📖 Assessment response:', assessmentRes);
        
        if (controller.signal.aborted) {
          console.log('⚠️ Initialization aborted after assessment fetch');
          setLoading(false);
          setDataReady(true);
          return;
        }
        
        // Check if response status is 200 (success: true)
        if (!assessmentRes.success) {
          console.error('❌ Assessment fetch failed, success:', assessmentRes.success);
          setError('Gagal memuat assessment');
          setLoading(false);
          setDataReady(true); // ✅ Allow error screen to show
          return;
        }
        
        const assessmentData = assessmentRes.data;
        console.log('✅ Assessment loaded (Status 200):', { id: assessmentData.id, title: assessmentData.title, totalQuestions: assessmentData.total_questions });

        let parsedAttemptId: number | null = null;

        // Step 2: Check if attemptId provided in query params
        if (attemptIdParam) {
          console.log('🔄 Attempt ID found in query params:', attemptIdParam);
          parsedAttemptId = parseInt(attemptIdParam, 10);
          console.log('🔢 Parsed attempt ID:', parsedAttemptId, 'isNaN:', isNaN(parsedAttemptId));
          
          if (isNaN(parsedAttemptId)) {
            console.error('❌ Invalid attemptId in query params:', attemptIdParam);
            setError('Invalid attempt ID');
            setLoading(false);
            setDataReady(true); // ✅ Allow error screen to show
            return;
          }
        } else {
          // Step 3: If no attemptId in params, check if there's an IN_PROGRESS attempt via GET /results
          console.log('📋 No attemptId in params, checking for active attempt via GET /results...');
          const activeAttemptRes = await assessmentResultService.getActiveAttemptBySlug(slug);
          console.log('📋 Active attempt response status:', activeAttemptRes.success ? '200 OK' : 'FAILED/NOT FOUND');
          
          if (controller.signal.aborted) {
            console.log('⚠️ Initialization aborted after active attempt check');
            setLoading(false);
            setDataReady(true);
            return;
          }

          if (activeAttemptRes.success && activeAttemptRes.data) {
            const activeAttempt = activeAttemptRes.data;
            
            // Check if status is IN_PROGRESS
            if (activeAttempt.status === 'IN_PROGRESS') {
              console.log('✅ Found IN_PROGRESS attempt (Status 200):', activeAttempt.id);
              parsedAttemptId = activeAttempt.id;
              setResumedFromActive(true);
            } else {
              console.log('⚠️ Found attempt but status is not IN_PROGRESS:', activeAttempt.status);
              console.error('❌ No active IN_PROGRESS attempt found, redirecting to detail page');
              setLoading(false);
              setDataReady(true); // ✅ Ensure state is ready before redirect
              router.push(`/assesmen/${slug}`);
              return;
            }
          } else {
            console.log('⚠️ No active attempt found, redirecting to detail page');
            setLoading(false);
            setDataReady(true); // ✅ Ensure state is ready before redirect
            router.push(`/assesmen/${slug}`);
            return;
          }
        }

        // Step 4: Set assessment and attempt ID data together
        if (parsedAttemptId !== null) {
          console.log('💾 Setting assessment and attempt ID...');
          setAssessment(assessmentData);
          setAttemptId(parsedAttemptId);
          console.log('💾 State updated with assessment and attempt ID');
          
          // Load answers from localStorage if they exist
          const savedAnswers = loadAnswersFromStorage(parsedAttemptId);
          if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            console.log('📖 Restoring answers from localStorage...');
            // Restore answers to the assessment state
            Object.entries(savedAnswers).forEach(([questionId, optionId]) => {
              assessmentState.selectAnswer(parseInt(questionId, 10), optionId);
            });
            console.log('✅ Answers restored from localStorage');
          }
          
          // ✅ FIXED: Only set loading to false after ALL data is confirmed ready (Status 200)
          console.log('✅ All data prepared and status 200 confirmed - marking data as ready');
          setDataReady(true);
          setLoading(false);
          console.log('✅ Initialization COMPLETE. Assessment: ' + assessmentData.title + ', Attempt ID: ' + parsedAttemptId);
        }
        
      } catch (err: any) {
        if (controller.signal.aborted) {
          console.log('⚠️ Initialization cancelled/aborted');
          setLoading(false);
          setDataReady(true);
          return;
        }
        
        console.error('❌ Error initializing assessment:', err.message || err);
        console.error('❌ Full error:', err);
        setError(
          err.response?.data?.message || 
          err.message ||
          'Terjadi kesalahan saat memuat assessment'
        );
        
        // ✅ Set loading to false on error
        setLoading(false);
        
        // ✅ CRITICAL FIX: Also set dataReady to true so error screen shows (not loading screen forever!)
        setDataReady(true);
      } finally {
        // ✅ Cleanup only
        if (controller.signal.aborted) {
          console.log('⚠️ FINALLY BLOCK: Controller was aborted');
        }
      }
    };

    initializeAssessment();

    // Cleanup on unmount
    return () => {
      console.log('🛑 Component unmounting, cleaning up...');
      controller.abort();
    };
  }, [slug, attemptIdParam]);

  // Handle answer selection - just store locally
  const handleSelectAnswer = useCallback(
    (optionId: number | string) => {
      if (!assessment || !attemptId) return;

      const currentQuestion = assessment.questions[assessmentState.currentQuestionIndex];
      
      // ✅ UPDATED: Only update local state - do NOT submit to backend immediately
      assessmentState.selectAnswer(currentQuestion.id, optionId);
      console.log(`📝 Answer selected for question ${currentQuestion.id}: option ${optionId} (stored locally)`);
      
      // Save to localStorage for persistence
      saveAnswersToStorage(attemptId, assessmentState.answers);
    },
    [assessment, assessmentState, attemptId]
  );

  // Handle finish assessment - submit all answers and finish
  const handleFinishAssessment = useCallback(
    async (autoFinish = false) => {
      if (!attemptId || !assessment) return;

      // Show warning if there are unanswered questions
      if (
        !autoFinish &&
        !assessmentState.areAllQuestionsAnswered() &&
        !showUnansweredWarning
      ) {
        console.log('⚠️ User trying to finish with unanswered questions');
        setShowUnansweredWarning(true);
        return;
      }

      try {
        setIsFinishingAssessment(true);
        console.log(`🏁 Finishing assessment, attempt ID: ${attemptId}`);
        console.log(`📦 Submitting ${Object.keys(assessmentState.answers).length} stored answers...`);

        // Step 1: Submit all stored answers in batch
        if (Object.keys(assessmentState.answers).length > 0) {
          try {
            const response = await assessmentAttemptService.submitAnswersBatch(
              attemptId,
              assessmentState.answers
            );
            console.log('✅ All answers submitted successfully:', response);
          } catch (batchError: any) {
            console.error('❌ Error submitting answers batch:', batchError);
            throw batchError;
          }
        } else {
          console.log('⚠️ No answers to submit');
        }

        // Step 2: Finish the assessment
        const finishResponse = await assessmentAttemptService.finishAssessment(attemptId);
        console.log('✅ Assessment finished, response:', finishResponse);

        if (finishResponse.success) {
          console.log(`✅ Score received:`, finishResponse.data);
          // Clear localStorage after successful submission
          clearAnswersFromStorage(attemptId);
          // Navigate to results page - results are already computed in backend
          // No need for GET /results, the POST /finish already provided the score
          router.push(`/assesmen/${slug}/hasil?attemptId=${attemptId}`);
        } else {
          console.error('❌ Finish assessment failed:', finishResponse.message);
          setError('Gagal menyelesaikan assessment');
        }
      } catch (err) {
        console.error('❌ Error finishing assessment:', err);
        setError('Terjadi kesalahan saat menyelesaikan assessment');
      } finally {
        setIsFinishingAssessment(false);
      }
    },
    [attemptId, assessment, assessmentState, showUnansweredWarning, slug, router]
  );

  // Show loading while fetching data from network
  if (loading || !dataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Mempersiapkan Assessment...</p>
          <p className="text-sm text-gray-500">(Tunggu hingga data siap ditampilkan)</p>
        </div>
      </div>
    );
  }

  // Show error if data failed to load
  if (error || !assessment || !attemptId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mb-6">{error || 'Gagal memulai assessment'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Reload
            </button>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[assessmentState.currentQuestionIndex];
  const selectedOptionId = assessmentState.getAnswerForQuestion(currentQuestion.id);
  const isAnswered = assessmentState.isQuestionAnswered(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDE - QUESTION */}
          <div className="lg:col-span-3">
            
            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <QuizQuestion
                question={currentQuestion}
                selectedOptionId={selectedOptionId}
                isAnswered={isAnswered}
                onSelectOption={handleSelectAnswer}
                disabled={timer.isTimeUp}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 mt-6">
              
              {/* Previous */}
              <button
                onClick={() => assessmentState.goToPreviousQuestion()}
                disabled={assessmentState.currentQuestionIndex === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Soal Sebelumnya
              </button>

              {/* Counter */}
              <div className="text-center px-4">
                <p className="text-sm text-gray-600">
                  Soal{' '}
                  <span className="font-bold">
                    {assessmentState.currentQuestionIndex + 1}
                  </span>{' '}
                  dari{' '}
                  <span className="font-bold">
                    {assessment.total_questions}
                  </span>
                </p>
              </div>

              {/* Next / Finish */}
              {assessmentState.currentQuestionIndex ===
              assessment.total_questions - 1 ? (
                <button
                  onClick={() => handleFinishAssessment(false)}
                  disabled={isFinishingAssessment || timer.isTimeUp}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isFinishingAssessment ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Menyelesaikan...
                    </>
                  ) : (
                    <>
                      <Flag className="w-5 h-5" />
                      Selesaikan Assessment
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => assessmentState.goToNextQuestion()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  Soal Berikutnya
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - QUESTION NAVIGATOR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 sticky top-6">
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">
                  Navigasi Soal
                </h3>

                <span className="text-sm text-gray-500">
                  {assessmentState.getAnsweredCount()}/
                  {assessment.total_questions}
                </span>
              </div>

              {/* Grid Navigator */}
              <div className="grid grid-cols-4 gap-2">
                {assessment.questions.map((_, index) => {
                  const questionId = assessment.questions[index].id;

                  const isCurrent =
                    index === assessmentState.currentQuestionIndex;

                  const isAnswered =
                    assessmentState.isQuestionAnswered(questionId);

                  return (
                    <button
                      key={index}
                      onClick={() => assessmentState.jumpToQuestion(index)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition-all duration-200 border ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                          : isAnswered
                          ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {isAnswered && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 mx-auto" />
                      ) : (
                        index + 1
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 space-y-2 text-xs text-gray-600">
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600"></div>
                  <span>Soal Aktif</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                  <span>Sudah Dijawab</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                  <span>Belum Dijawab</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function AssessmentLoadingFallback() {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    } else {
      // Reload setelah countdown selesai
      console.log('⏱️ Loading timeout - auto reloading page...');
      window.location.reload();
    }
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-600">Mempersiapkan Assessment...</p>
        <p className="text-sm text-gray-500">(Reload dalam {countdown} detik)</p>
      </div>
    </div>
  );
}

// Main export with Error Boundary and Suspense
export default function AssessmentQuizPage() {
  return (
    <AssessmentErrorBoundary>
      <Suspense fallback={<AssessmentLoadingFallback />}>
        <AssessmentQuizContent />
      </Suspense>
    </AssessmentErrorBoundary>
  );
}
