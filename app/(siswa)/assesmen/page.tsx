'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle, Search, Clock, BookOpen } from 'lucide-react';
import { assessmentService } from '@/lib/api-services';
import { Assessment, PaginationMeta } from '@/lib/types/assessment.types';
import { useToast } from '@/hooks/use-toast';

export default function AssessmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await assessmentService.getAllAssessments(
          currentPage,
          15,
          searchQuery || undefined
        );
        
        if (response.success) {
          setAssessments(response.data);
          setPagination(response.pagination);
        } else {
          setError('Gagal mengambil data assessment');
        }
      } catch (err: any) {
        console.error('Error fetching assessments:', err);
        setError(
          err.response?.data?.message ||
          'Terjadi kesalahan saat mengambil data assessment'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [currentPage, searchQuery]);

  const handleStartAssessment = (assessment: Assessment) => {
    router.push(`/assesmen/${assessment.slug}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page
  };

  if (loading && assessments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Memuat Assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessment</h1>
          <p className="text-lg text-gray-600">
            Ukur pengetahuan Anda melalui berbagai assessment yang tersedia
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari assessment..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Assessments Grid */}
        {assessments.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300"
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {assessment.description}
                      </p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-6 py-4 border-y border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{assessment.time_limit} menit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{assessment.total_questions} soal</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleStartAssessment(assessment)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>

                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(pagination.last_page, currentPage + 1)
                  )
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
                  onClick={() =>
                    setCurrentPage(
                      Math.min(pagination.last_page, currentPage + 1)
                    )
                  }
                  disabled={currentPage === pagination.last_page}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchQuery
                ? 'Tidak ada assessment yang cocok dengan pencarian Anda'
                : 'Tidak ada assessment tersedia saat ini'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
