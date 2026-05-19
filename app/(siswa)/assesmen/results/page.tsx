'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle, Eye, ArrowLeft } from 'lucide-react';
import { assessmentResultService } from '@/lib/api-services';
import { AssessmentResult, PaginationMeta } from '@/lib/types/assessment.types';

export default function AssessmentResultsPage() {
  const router = useRouter();

  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await assessmentResultService.getAllResults(currentPage, 10);
        
        if (response.success) {
          setResults(response.data);
          setPagination(response.pagination);
        } else {
          setError('Gagal mengambil data hasil');
        }
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError(
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil data hasil'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [currentPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'TIMEOUT':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai';
      case 'TIMEOUT':
        return 'Waktu Habis';
      case 'IN_PROGRESS':
        return 'Dalam Proses';
      default:
        return status;
    }
  };

  if (loading && results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Memuat Riwayat Hasil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/assesmen')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Assessment
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Riwayat Assessment</h1>
          <p className="text-lg text-gray-600">Lihat semua hasil assessment Anda</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Nama Assessment
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Persentase
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.attempt_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {result.assessment_title}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-lg font-bold text-blue-600">{result.score}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${result.percentage}%` }}
                            />
                          </div>
                          <span className="font-medium text-gray-700">{result.percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {result.completed_at
                          ? new Date(result.completed_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/results/${result.attempt_id}`)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 2), Math.min(pagination.last_page, currentPage + 1))
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                  disabled={currentPage === pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Anda belum memiliki riwayat assessment</p>
          </div>
        )}
      </div>
    </div>
  );
}
