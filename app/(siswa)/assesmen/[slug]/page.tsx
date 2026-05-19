'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader, AlertCircle, Clock, BookOpen, ChevronRight, ArrowLeft, CheckCircle, XCircle, Eye } from 'lucide-react';
import { assessmentService, assessmentAttemptService, assessmentResultService } from '@/lib/api-services';
import { AssessmentDetail } from '@/lib/types/assessment.types';

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
  const slug = params.slug as string;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [userResult, setUserResult] = useState<AssessmentResult | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [allResults, setAllResults] = useState<AssessmentResult[]>([]);
  const [showAllResults, setShowAllResults] = useState(false);

  // Fetch assessment detail and user results
  useEffect(() => {
    const fetchAssessmentAndResults = async () => {
      try {
        setLoading(true);
        console.log('📖 Fetching assessment by slug:', slug);
        const response = await assessmentService.getAssessmentBySlug(slug);
        console.log('✅ Assessment fetched:', response);
        
        if (response.success) {
          setAssessment(response.data);
        } else {
          setError('Gagal mengambil data assessment');
        }
      } catch (err: any) {
        console.error('❌ Error fetching assessment:', err);
        setError(
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil data assessment'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentAndResults();
  }, [slug]);

  // Fetch user's assessment results
  useEffect(() => {
    const fetchUserResults = async () => {
      try {
        setResultsLoading(true);
        console.log('� [START] Fetching user assessment results using GET /results...');
        console.log('🔥 Slug:', slug);
        
        const resultsResponse = await assessmentResultService.getAllResults(1, 15);
        console.log('🔥 Full response from GET /results:', resultsResponse);
        console.log('🔥 Response structure:', { success: resultsResponse.success, hasData: !!resultsResponse.data, dataType: typeof resultsResponse.data });
        
        // Handle nested data structure
        let resultsData = resultsResponse.data;
        
        // Check if data is nested (response.data.data)
        if (resultsData && typeof resultsData === 'object' && !Array.isArray(resultsData) && resultsData.data) {
          console.log('🔥 Detected nested data structure, extracting from response.data.data');
          resultsData = resultsData.data;
        }
        
        console.log('🔥 Results data type:', typeof resultsData, 'Is Array:', Array.isArray(resultsData));
        
        if (resultsResponse.success && resultsData && Array.isArray(resultsData)) {
          console.log('🔥 Successfully got array data, total items:', resultsData.length);
          
          // Filter results for this specific assessment by slug
          const filteredResults = resultsData.filter(
            (result: AssessmentResult) => result.assessment?.slug === slug
          );
          
          console.log(`🔥 Filtered ${filteredResults.length} results for slug: ${slug}`);
          setAllResults(filteredResults);
          
          // Find the most recent result as the main result
          const matchingResult = filteredResults[0] || null;
          
          if (matchingResult) {
            console.log('🔥 ✅ Found most recent result for assessment:', matchingResult);
            setUserResult(matchingResult);
          } else {
            console.log('🔥 ⚠️ No existing result found for this assessment');
            setUserResult(null);
          }
        } else {
          console.log('🔥 ❌ Response structure invalid:', { success: resultsResponse.success, dataIsArray: Array.isArray(resultsData) });
        }
      } catch (err: any) {
        console.error('🔥 ❌ Error fetching user results:', err);
        console.error('🔥 Error response:', err.response?.data);
        setUserResult(null);
      } finally {
        setResultsLoading(false);
      }
    };

    if (slug) {
      console.log('🔥 [TRIGGER] useEffect for results fetch, slug:', slug);
      fetchUserResults();
    } else {
      console.log('🔥 [SKIP] No slug available');
    }
  }, [slug]);

  const handleStartAssessment = async () => {
    if (!assessment) return;

    try {
      setIsStarting(true);
      setError(null);
      
      console.log('🚀 Starting assessment, ID:', assessment.id);
      console.log('🔍 Step 1: Checking for active IN_PROGRESS attempt using GET /results...');
      
      // Step 1: Check if there's an active IN_PROGRESS attempt by slug using GET /results
      const activeAttemptRes = await assessmentResultService.getActiveAttemptBySlug(slug);
      console.log('✅ Active attempt check response:', activeAttemptRes);
      
      if (activeAttemptRes.success && activeAttemptRes.data) {
        const activeAttempt = activeAttemptRes.data;
        
        // Use the existing IN_PROGRESS attempt
        if (activeAttempt.status === 'IN_PROGRESS') {
          console.log('✅ Found IN_PROGRESS attempt, ID:', activeAttempt.id);
          console.log('🔄 Redirecting to quiz with existing attempt ID:', activeAttempt.id);
          
          // Redirect to quiz page WITH existing attemptId
          router.push(`/assesmen/${slug}/quiz?attemptId=${activeAttempt.id}`);
          return;
        }
      } else {
        console.log('⚠️ No active IN_PROGRESS attempt found, will create new one');
      }

      // Step 2: No IN_PROGRESS attempt found, create new one with POST /start
      console.log('📤 Step 2: Sending POST /assessments/{id}/start to create new attempt...');
      const startResponse = await assessmentAttemptService.startAssessment(assessment.id);
      console.log('✅ Start response:', startResponse);
      
      if (startResponse.success && startResponse.data.attempt_id) {
        const attemptId = startResponse.data.attempt_id;
        console.log('✅ New attempt created, ID:', attemptId);
        console.log('🔄 Redirecting to quiz with attempt ID:', attemptId);
        
        // Redirect to quiz page WITH attemptId in query params
        router.push(`/assesmen/${slug}/quiz?attemptId=${attemptId}`);
      } else {
        console.error('❌ Start response not successful:', startResponse);
        setError(startResponse.message || 'Gagal memulai assessment');
        setIsStarting(false);
      }
    } catch (err: any) {
      console.error('❌ Error in handleStartAssessment:', err);
      setError(
        err.response?.data?.message ||
        'Gagal memulai assessment'
      );
      setIsStarting(false);
    }
  };

  // Handle viewing result detail
  const handleViewResult = async (resultId: string) => {
    console.log('👁️ Viewing result detail for attempt ID:', resultId);
    router.push(`/assesmen/${slug}/hasil?attemptId=${resultId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Memuat Assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Assessment</h1>
          <p className="text-gray-600 mb-6">{error || 'Assessment tidak ditemukan'}</p>
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
        <button
          onClick={() => router.push('/assesmen')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Assessment
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{assessment.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{assessment.description}</p>
            </div>

            {/* Results Section - Tampilkan hasil jika ada */}
            {userResult && (
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Hasil Assessment</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    userResult.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userResult.status === 'COMPLETED' ? 'Selesai' : 'Sedang Dikerjakan'}
                  </span>
                </div>

                {/* Score Display - Hanya tampilkan jika COMPLETED */}
                {userResult.status === 'COMPLETED' && (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Skor Anda</p>
                        <p className="text-4xl font-bold text-green-600">{userResult.score}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-1 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wider">Dimulai</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(userResult.started_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {userResult.status === 'COMPLETED' && userResult.completed_at && (
                    <div className="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-1 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wider">Selesai</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(userResult.completed_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button untuk melihat detail */}
                {userResult.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleViewResult(userResult.id)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Lihat Detail Jawaban
                  </button>
                )}
              </div>
            )}

            {/* Riwayat Attempt - Tampilkan jika ada lebih dari 1 attempt */}
            {allResults.length > 1 && (
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
                <button
                  onClick={() => setShowAllResults(!showAllResults)}
                  className="w-full flex items-center justify-between mb-6 hover:opacity-75 transition-opacity"
                >
                  <h3 className="text-lg font-bold text-gray-900">Riwayat Attempt ({allResults.length})</h3>
                  <ChevronRight className={`w-5 h-5 text-gray-600 transition-transform ${showAllResults ? 'rotate-90' : ''}`} />
                </button>

                {showAllResults && (
                  <div className="space-y-3">
                    {allResults.map((result, index) => (
                      <div
                        key={result.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Attempt {index + 1}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(result.created_at).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {result.status === 'COMPLETED' && (
                            <p className="text-lg font-bold text-green-600 mt-1">Skor: {result.score}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {result.status === 'COMPLETED' ? 'Selesai' : 'Berlangsung'}
                          </span>
                          {result.status === 'COMPLETED' && (
                            <button
                              onClick={() => handleViewResult(result.id)}
                              className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              Lihat
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Batas Waktu</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.time_limit} Menit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Total Soal</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.total_questions} Soal</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Tips:</span> Pastikan Anda memiliki waktu yang cukup dan koneksi internet yang stabil sebelum memulai.
                </p>
              </div>

              {userResult?.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    if (userResult?.status === 'COMPLETED') {
                      handleViewResult(userResult.id);
                    } else {
                      handleStartAssessment();
                    }
                  }}
                  disabled={isStarting || resultsLoading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isStarting || resultsLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {userResult?.status === 'IN_PROGRESS'
                        ? 'Melanjutkan...'
                        : 'Memulai...'}
                    </>
                  ) : (
                    <>
                      {userResult?.status === 'IN_PROGRESS'
                        ? 'Lanjutkan'
                        : 'Mulai'}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Anda akan diberi waktu {assessment.time_limit} menit untuk menjawab semua soal. Pertanyaan tidak dapat dilewati.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
