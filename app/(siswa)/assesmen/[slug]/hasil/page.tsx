'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import { assessmentResultService } from '@/lib/api-services';
import { ResultDetail } from '@/lib/types/assessment.types';
import { ScoreDisplay, AnswerReview } from '@/components/assesmen';

export default function AssessmentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [result, setResult] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch result detail
  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) {
        setError('Attempt ID tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await assessmentResultService.getResultDetail(attemptId);
        
        if (response.success) {
          const data = response.data;
          // Map API response to ResultDetail type with computed properties
          const mappedResult = {
            ...data,
            assessment_title: data.assessment?.title || 'Assessment',
            percentage: Math.round((data.correct_answers / data.total_questions) * 100),
          };
          setResult(mappedResult as any);
        } else {
          setError('Gagal mengambil hasil assessment');
        }
      } catch (err: any) {
        console.error('Error fetching result:', err);
        setError(
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil hasil'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Memuat Hasil...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Hasil</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/assesmen')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Kembali ke Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/assesmen')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Assessment
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.assessment_title}</h1>
          <p className="text-gray-600">Hasil Assessment Anda</p>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-100">
          <ScoreDisplay
            score={parseFloat(result.score as unknown as string)}
            totalQuestions={result.total_questions}
            correctAnswers={result.correct_answers}
            percentage={result.percentage || 0}
            status={result.status as 'COMPLETED' | 'TIMEOUT'}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
          <button
            onClick={() => router.push('/assesmen')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Kembali ke Assessment
          </button>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkasan</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-blue-600">{parseFloat(result.score as unknown as string).toFixed(2)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Benar</p>
              <p className="text-2xl font-bold text-green-600">{result.correct_answers}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Salah</p>
              <p className="text-2xl font-bold text-red-600">{result.total_questions - result.correct_answers}</p>
            </div>
          </div>
        </div>

        {/* Detailed Questions Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Jawaban</h2>
          <div className="space-y-4">
            {result.answers && result.answers.length > 0 ? (
              result.answers.map((answer, index) => (
                <div key={index}>
                  <AnswerReview
                    questionNumber={index + 1}
                    answer={answer}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada data jawaban yang tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
