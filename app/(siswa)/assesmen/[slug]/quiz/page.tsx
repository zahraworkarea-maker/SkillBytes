'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader, ChevronLeft, ChevronRight, Flag, CheckCircle2 } from 'lucide-react';
import { assessmentService, assessmentAttemptService, assessmentResultService } from '@/lib/api-services';
import { AssessmentDetail } from '@/lib/types/assessment.types';
import { useAssessmentTimer } from '@/hooks/use-assessment-timer';
import { useAssessmentState } from '@/hooks/use-assessment-state';
import { TimerDisplay, QuizQuestion } from '@/components/assesmen';

// ─── localStorage helpers ─────────────────────────────────────────────────────
const STORAGE_KEY_PREFIX = 'assessment_answers_';
const TIMER_STORAGE_KEY_PREFIX = 'assessment_timer_';

interface TimerStorageData {
  timeRemaining: number;
  startTime: number;
  status: string;
}

const saveAnswersToStorage = (
  attemptId: number,
  answers: Record<number | string, number | string>
) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${attemptId}`, JSON.stringify(answers));
  } catch (err) {
    console.error('❌ Failed to save answers to localStorage:', err);
  }
};

const loadAnswersFromStorage = (
  attemptId: number
): Record<number | string, number | string> | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${attemptId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('❌ Failed to load answers from localStorage:', err);
    return null;
  }
};

const clearAnswersFromStorage = (attemptId: number) => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${attemptId}`);
    localStorage.removeItem(`${TIMER_STORAGE_KEY_PREFIX}${attemptId}`);
  } catch (err) {
    console.error('❌ Failed to clear answers from localStorage:', err);
  }
};

const saveTimerToStorage = (attemptId: number, timeRemaining: number, startTime: number, status: string) => {
  try {
    const timerData: TimerStorageData = {
      timeRemaining,
      startTime,
      status,
    };
    localStorage.setItem(`${TIMER_STORAGE_KEY_PREFIX}${attemptId}`, JSON.stringify(timerData));
  } catch (err) {
    console.error('❌ Failed to save timer to localStorage:', err);
  }
};

const loadTimerFromStorage = (attemptId: number): TimerStorageData | null => {
  try {
    const stored = localStorage.getItem(`${TIMER_STORAGE_KEY_PREFIX}${attemptId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('❌ Failed to load timer from localStorage:', err);
    return null;
  }
};

// ─── Error Boundary ───────────────────────────────────────────────────────────
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
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-10 h-10 text-green-600 animate-spin" />
            <p className="text-gray-600">Memuat soal...</p>
            <p className="text-sm text-gray-500">(Tunggu beberapa detik)</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AssessmentQuizContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const attemptIdParam = searchParams.get('attemptId');

  const abortController = useRef<AbortController | null>(null);
  const handleFinishRef = useRef<((autoFinish?: boolean) => Promise<void>) | null>(null);
  const answersRef = useRef<Record<number | string, number | string>>({});
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingStartTimeRef = useRef<number>(Date.now());
  const reloadAttemptsRef = useRef<number>(0);

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnansweredWarning, setShowUnansweredWarning] = useState(false);
  const [isFinishingAssessment, setIsFinishingAssessment] = useState(false);
  const [resumedFromActive, setResumedFromActive] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [reloadCountdown, setReloadCountdown] = useState<number | null>(null);
  
  // Timer state yang akan disimpan ke localStorage
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timeStatus, setTimeStatus] = useState<string>('idle');
  const [formattedTime, setFormattedTime] = useState<string>('00:00');
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number>(Date.now());

  // Auto-reload effect has been removed to prevent infinite loops and premature reloads.
  // The API should be allowed to take as much time as it needs without forcing a page reload.

  // Fungsi untuk update timer UI
  const updateTimerUI = useCallback((remaining: number) => {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    setFormattedTime(formatted);
    
    // Update status berdasarkan waktu tersisa
    if (remaining <= 60) {
      setTimeStatus('danger');
    } else if (remaining <= 300) {
      setTimeStatus('warning');
    } else {
      setTimeStatus('normal');
    }
    
    setTimeRemaining(remaining);
    
    // Set isTimeUp jika waktu habis
    if (remaining <= 0 && !isTimeUp) {
      setIsTimeUp(true);
      setTimeStatus('expired');
    }
  }, [isTimeUp]);

  // Fungsi untuk memulai timer dari server atau localStorage
  const startTimer = useCallback((initialTime: number, savedStartTime?: number) => {
    // Hentikan timer yang sedang berjalan
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    let currentStartTime = savedStartTime || Date.now();
    let currentTimeRemaining = initialTime;
    
    const updateTimer = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - currentStartTime) / 1000);
      let remaining = Math.max(0, currentTimeRemaining - elapsedSeconds);
      
      updateTimerUI(remaining);
      
      // Simpan ke localStorage setiap detik
      if (attemptId) {
        saveTimerToStorage(attemptId, remaining, currentStartTime, 'running');
      }
      
      // Jika waktu habis, auto submit
      if (remaining <= 0 && !isFinishingAssessment) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        
        if (handleFinishRef.current) {
          console.log('⏱️ Time is up! Auto-submitting assessment...');
          handleFinishRef.current(true);
        }
      }
    };
    
    // Update setiap detik
    timerIntervalRef.current = setInterval(updateTimer, 1000);
    updateTimer(); // Update segera
    
  }, [attemptId, updateTimerUI, isFinishingAssessment]);

  // ─── Initialize assessment ───────────────────────────────────────────────
  // Assessment state hook harus dipanggil sebelum digunakan oleh efek/init
  const assessmentState = useAssessmentState({
    totalQuestions: assessment?.total_questions || 0,
  });

  useEffect(() => {
    loadingStartTimeRef.current = Date.now();

    const controller = new AbortController();
    abortController.current = controller;

    const initializeAssessment = async () => {
      try {
        setLoading(true);
        setError(null);
        setDataReady(false);

        // Step 1: Fetch assessment by slug
        const assessmentRes = await assessmentService.getAssessmentBySlug(slug);
        if (controller.signal.aborted) return;

        if (!assessmentRes.success) {
          setError('Gagal memuat assessment');
          return;
        }

        const assessmentData = assessmentRes.data;
        let parsedAttemptId: number | null = null;

        // Step 2: Resolve attemptId
        if (attemptIdParam) {
          parsedAttemptId = parseInt(attemptIdParam, 10);
          if (isNaN(parsedAttemptId)) {
            setError('Invalid attempt ID');
            return;
          }
        } else {
          // Step 3: Cek active attempt dari server
          const activeAttemptRes = await assessmentResultService.getActiveAttemptBySlug(slug);
          if (controller.signal.aborted) return;

          if (activeAttemptRes.success && activeAttemptRes.data) {
            if (activeAttemptRes.data.status === 'IN_PROGRESS') {
              parsedAttemptId = activeAttemptRes.data.id;
              setResumedFromActive(true);
            } else {
              router.push(`/assesmen/${slug}`);
              return;
            }
          } else {
            router.push(`/assesmen/${slug}`);
            return;
          }
        }

        // Step 4: Siapkan semua data sekaligus
        if (parsedAttemptId !== null) {
          setAssessment(assessmentData);
          setAttemptId(parsedAttemptId);

          // Restore answers dari localStorage
          const savedAnswers = loadAnswersFromStorage(parsedAttemptId);
          if (savedAnswers && Object.keys(savedAnswers).length > 0) {
            // Restore ke state hook
            Object.entries(savedAnswers).forEach(([questionId, optionId]) => {
              assessmentState.selectAnswer(parseInt(questionId, 10), optionId);
            });
            answersRef.current = { ...savedAnswers };
          }
          
          // Restore timer dari localStorage
          const savedTimer = loadTimerFromStorage(parsedAttemptId);
          if (savedTimer && savedTimer.timeRemaining > 0) {
            // Hitung ulang waktu yang tersisa berdasarkan startTime
            const elapsedSinceLastSave = Math.floor((Date.now() - savedTimer.startTime) / 1000);
            const actualRemaining = Math.max(0, savedTimer.timeRemaining - elapsedSinceLastSave);
            
            if (actualRemaining > 0) {
              // Timer masih berjalan, lanjutkan dari waktu yang tersisa
              startTimer(actualRemaining, savedTimer.startTime);
            } else {
              // Timer sudah habis, auto submit
              setIsTimeUp(true);
              if (handleFinishRef.current) {
                handleFinishRef.current(true);
              }
            }
          } else {
            // Timer baru, mulai dari time_limit assessment
            const totalSeconds = (assessmentData.time_limit - 5) * 60;
            const currentStartTime = Date.now();
            setTimerStartTime(currentStartTime);
            startTimer(totalSeconds, currentStartTime);
            
            // Simpan ke localStorage
            saveTimerToStorage(parsedAttemptId, totalSeconds, currentStartTime, 'running');
          }
        }
      } catch (err: any) {
        if (controller.signal.aborted) return;
        console.error('❌ Error initializing assessment:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          'Terjadi kesalahan saat memuat assessment'
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setDataReady(true);
        }
      }
    };

    initializeAssessment();

    return () => {
      controller.abort();
      // Cleanup timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [slug, attemptIdParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simpan timer ke localStorage saat komponen unmount atau refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (attemptId && timeRemaining > 0) {
        // Simpan state timer terakhir sebelum page di-refresh atau ditutup
        saveTimerToStorage(attemptId, timeRemaining, timerStartTime, timeStatus);
        saveAnswersToStorage(attemptId, answersRef.current);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [attemptId, timeRemaining, timerStartTime, timeStatus]);

  // ─── handleFinishAssessment ───────────────────────────────────────────────
  const handleFinishAssessment = useCallback(
    async (autoFinish = false) => {
      if (!attemptId || !assessment) return;

      if (
        !autoFinish &&
        !assessmentState.areAllQuestionsAnswered() &&
        !showUnansweredWarning
      ) {
        setShowUnansweredWarning(true);
        return;
      }

      // Guard double-submit
      if (isFinishingAssessment) return;

      try {
        setIsFinishingAssessment(true);
        
        // Stop timer jika masih berjalan
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        const currentAnswers = answersRef.current;
        console.log(`📦 Submitting ${Object.keys(currentAnswers).length} answers...`);

        if (Object.keys(currentAnswers).length > 0) {
          await assessmentAttemptService.submitAnswersBatch(attemptId, currentAnswers);
          console.log('✅ Answers submitted successfully');
        } else {
          console.log('⚠️ No answers to submit');
        }

        const finishResponse = await assessmentAttemptService.finishAssessment(attemptId);

        if (finishResponse.success) {
          clearAnswersFromStorage(attemptId);
          router.push(`/assesmen/${slug}/hasil?attemptId=${attemptId}`);
        } else {
          setError('Gagal menyelesaikan assessment');
        }
      } catch (err) {
        console.error('❌ Error finishing assessment:', err);
        setError('Terjadi kesalahan saat menyelesaikan assessment');
      } finally {
        setIsFinishingAssessment(false);
      }
    },
    [attemptId, assessment, assessmentState, showUnansweredWarning, isFinishingAssessment, slug, router]
  );

  // Update ref setiap kali handleFinishAssessment berubah
  useEffect(() => {
    handleFinishRef.current = handleFinishAssessment;
  }, [handleFinishAssessment]);

  // Efek untuk memicu auto-submit secara reliable ketika waktu habis
  useEffect(() => {
    if (isTimeUp && dataReady && attemptId && assessment && !isFinishingAssessment) {
      console.log('⏳ isTimeUp is true, triggering auto-submit via effect...');
      handleFinishAssessment(true);
    }
  }, [isTimeUp, dataReady, attemptId, assessment, isFinishingAssessment, handleFinishAssessment]);

  // ─── handleSelectAnswer ───────────────────────────────────────────────────
  const handleSelectAnswer = useCallback(
    (optionId: number | string) => {
      if (!assessment || !attemptId) return;

      const currentQuestion = assessment.questions[assessmentState.currentQuestionIndex];

      // Update state hook
      assessmentState.selectAnswer(currentQuestion.id, optionId);

      // Update answersRef dengan nilai terbaru
      const updatedAnswers = {
        ...answersRef.current,
        [currentQuestion.id]: optionId,
      };
      answersRef.current = updatedAnswers;

      // Simpan ke localStorage
      saveAnswersToStorage(attemptId, updatedAnswers);

      console.log(`📝 Answer saved — Q${currentQuestion.id}: option ${optionId}`);
    },
    [assessment, assessmentState, attemptId]
  );

  // ─── Render: Loading ──────────────────────────────────────────────────────
  if (loading || !dataReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Mempersiapkan Assessment...</p>
          <p className="text-sm text-gray-500">(Tunggu hingga data siap ditampilkan)</p>
          {reloadCountdown !== null && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium">
                Assesmen akan dimulai dalam {reloadCountdown} detik...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <p className="text-red-600 font-semibold">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Halaman
            </button>
            <button
              onClick={() => router.push(`/assesmen/${slug}`)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Kembali ke Detail Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Tidak ada data soal</p>
      </div>
    );
  }

  const currentQuestion = assessment.questions[assessmentState.currentQuestionIndex];
  const selectedOptionId = assessmentState.getAnswerForQuestion(currentQuestion.id);
  const isAnswered = assessmentState.isQuestionAnswered(currentQuestion.id);

  // Map internal timeStatus to TimerDisplay expected union
  const displayStatus: 'normal' | 'warning' | 'critical' =
    timeStatus === 'warning'
      ? 'warning'
      : timeStatus === 'danger' || timeStatus === 'expired'
      ? 'critical'
      : 'normal';

  // ─── Render: Quiz ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Timer Warning Banner saat waktu hampir habis */}
        {timeRemaining <= 60 && timeRemaining > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm font-medium text-center">
              ⚠️ Waktu tersisa {formattedTime}! Segera selesaikan assessment.
            </p>
          </div>
        )}

        {/* Unanswered Warning Banner */}
        {showUnansweredWarning && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center justify-between">
            <p className="text-yellow-800 text-sm font-medium">
              Yakin ingin menyelesaikan?
            </p>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setShowUnansweredWarning(false)}
                className="px-3 py-1 text-sm border border-yellow-400 text-yellow-800 rounded hover:bg-yellow-100"
              >
                Batal
              </button>
              <button
                onClick={() => handleFinishAssessment(true)}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Kirim Jawaban
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT — Question */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <QuizQuestion
                question={currentQuestion}
                selectedOptionId={selectedOptionId}
                isAnswered={isAnswered}
                onSelectOption={handleSelectAnswer}
                disabled={isTimeUp || isFinishingAssessment}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 mt-6">
              <button
                onClick={() => assessmentState.goToPreviousQuestion()}
                disabled={assessmentState.currentQuestionIndex === 0 || isFinishingAssessment}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Soal Sebelumnya
              </button>

              <div className="text-center px-4">
                <p className="text-sm text-gray-600">
                  Soal <span className="font-bold">{assessmentState.currentQuestionIndex + 1}</span>
                  {' '}dari{' '}
                  <span className="font-bold">{assessment.total_questions}</span>
                </p>
              </div>

              {assessmentState.currentQuestionIndex === assessment.total_questions - 1 ? (
                <button
                  onClick={() => handleFinishAssessment(false)}
                  disabled={isFinishingAssessment}
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
                  disabled={isFinishingAssessment || !isAnswered}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isFinishingAssessment ? <Loader className="w-5 h-5 animate-spin" /> : "Selanjutnya"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — Navigator */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <TimerDisplay
                timeRemaining={timeRemaining}
                status={displayStatus}
                formattedTime={formattedTime}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Navigasi Soal</h3>
              </div>
              <div className="p-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800 text-center">
                <p className="font-semibold mb-1">🧠 DKT Mode Active</p>
                <p className="text-xs">Pertanyaan dievaluasi secara dinamis.</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {assessment.questions.map((q, idx) => {
                  const answered = assessmentState.isQuestionAnswered(q.id);
                  const current = assessmentState.currentQuestionIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => assessmentState.jumpToQuestion(idx)}
                      disabled={isFinishingAssessment}
                      className={`w-10 h-10 rounded-lg font-medium flex items-center justify-center transition-colors ${
                        current
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : answered
                          ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Sedang dikerjakan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                  <span>Belum dijawab</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Loading Fallback ─────────────────────────────────────────────────────────
function AssessmentLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-600">Mempersiapkan Assessment...</p>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AssessmentQuizPage() {
  return (
    <AssessmentErrorBoundary>
      <Suspense fallback={<AssessmentLoadingFallback />}>
        <AssessmentQuizContent />
      </Suspense>
    </AssessmentErrorBoundary>
  );
}