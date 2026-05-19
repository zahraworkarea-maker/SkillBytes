'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader, AlertCircle, Clock, BookOpen, ChevronRight, ArrowLeft } from 'lucide-react';
import { assessmentService } from '@/lib/api-services';
import { AssessmentDetail } from '@/lib/types/assessment.types';

export default function AssessmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Fetch assessment detail
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await assessmentService.getAssessmentBySlug(slug);
        
        if (response.success) {
          setAssessment(response.data);
        } else {
          setError('Gagal mengambil data assessment');
        }
      } catch (err: any) {
        console.error('Error fetching assessment:', err);
        setError(
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil data assessment'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [slug]);

  const handleStartAssessment = async () => {
    if (!assessment) return;

    try {
      setIsStarting(true);
      // Navigate to quiz page - the quiz page will handle the API call
      router.push(`/assesmen/${slug}/quiz`);
    } catch (err) {
      console.error('Error starting assessment:', err);
      setError('Gagal memulai assessment');
      setIsStarting(false);
    }
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/assesmen')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Assessment
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Description */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{assessment.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{assessment.description}</p>
            </div>
          </div>

          {/* Sidebar - Info & Start Button */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 sticky top-8 space-y-6">
              {/* Info Cards */}
              <div className="space-y-4">
                {/* Time Limit */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Batas Waktu</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.time_limit} Menit</p>
                  </div>
                </div>

                {/* Total Questions */}
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <BookOpen className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Total Soal</p>
                    <p className="text-lg font-bold text-gray-900">{assessment.total_questions} Soal</p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Tips:</span> Pastikan Anda memiliki waktu yang cukup dan koneksi internet yang stabil sebelum memulai.
                </p>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartAssessment}
                disabled={isStarting}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isStarting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Memulai...
                  </>
                ) : (
                  <>
                    Mulai Assessment Sekarang
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Info */}
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
