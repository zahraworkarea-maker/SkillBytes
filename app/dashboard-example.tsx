'use client';

import { useCallback, useMemo, memo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { userService, courseService, assessmentService } from '@/lib/api-services';
import { useCachedData } from '@/hooks/use-cached-data';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';

// Memoized Stats Card Component
const StatsCard = memo(({ title, value, color, loading }: {
  title: string;
  value: number;
  color: string;
  loading: boolean;
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className={`text-3xl font-bold ${color} mt-2`}>
      {loading ? <Skeleton className="h-8 w-16" /> : value}
    </p>
  </div>
));
StatsCard.displayName = 'StatsCard';

// Memoized User Row Component
const UserRow = memo(({ usr }: { usr: any }) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="px-4 py-2">{usr.id}</td>
    <td className="px-4 py-2">{usr.name}</td>
    <td className="px-4 py-2">{usr.email}</td>
  </tr>
));
UserRow.displayName = 'UserRow';

// Memoized Course Card Component
const CourseCard = memo(({ course }: { course: any }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition">
    <h3 className="font-semibold text-gray-900">{course.name}</h3>
    <p className="text-gray-600 text-sm mt-1">{course.description}</p>
  </div>
));
CourseCard.displayName = 'CourseCard';

// Memoized Assessment Item Component
const AssessmentItem = memo(({ assessment }: { assessment: any }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-900">{assessment.title}</h3>
        <p className="text-gray-600 text-sm mt-1">{assessment.description}</p>
      </div>
      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        {assessment.status || 'Pending'}
      </span>
    </div>
  </div>
));
AssessmentItem.displayName = 'AssessmentItem';

export default function DashboardExample() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Use cached data hooks untuk setiap API call
  const usersResult = useCachedData(
    useCallback(() => userService.getAllUsers().then(res => res.data || res), []),
    { cacheKey: 'dashboard-users', cacheTTL: 600 } // 10 menit
  );

  const coursesResult = useCachedData(
    useCallback(() => courseService.getAllCourses().then(res => res.data || res), []),
    { cacheKey: 'dashboard-courses', cacheTTL: 600 }
  );

  const assessmentsResult = useCachedData(
    useCallback(() => assessmentService.getAllAssessments().then(res => res.data || res), []),
    { cacheKey: 'dashboard-assessments', cacheTTL: 600 }
  );

  // Memoize combined loading state
  const isLoading = useMemo(
    () => usersResult.loading || coursesResult.loading || assessmentsResult.loading,
    [usersResult.loading, coursesResult.loading, assessmentsResult.loading]
  );

  // Get first error jika ada
  const error = useMemo(
    () => usersResult.error?.message || coursesResult.error?.message || assessmentsResult.error?.message || '',
    [usersResult.error, coursesResult.error, assessmentsResult.error]
  );

  // Redirect jika belum login
  if (!authLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
            {error}
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard 
            title="Total Users" 
            value={usersResult.data?.length || 0} 
            color="text-blue-600" 
            loading={usersResult.loading}
          />
          <StatsCard 
            title="Total Courses" 
            value={coursesResult.data?.length || 0} 
            color="text-green-600" 
            loading={coursesResult.loading}
          />
          <StatsCard 
            title="Total Assessments" 
            value={assessmentsResult.data?.length || 0} 
            color="text-purple-600" 
            loading={assessmentsResult.loading}
          />
        </div>

        {/* Users Table */}
        <section className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Users List</h2>
            {usersResult.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (usersResult.data && usersResult.data.length > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">ID</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersResult.data.slice(0, 5).map((usr: any) => (
                      <UserRow key={usr.id} usr={usr} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada data users</p>
            )}
          </div>
        </section>

        {/* Courses List */}
        <section className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Courses</h2>
            {coursesResult.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (coursesResult.data && coursesResult.data.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coursesResult.data.slice(0, 4).map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada courses</p>
            )}
          </div>
        </section>

        {/* Assessments List */}
        <section className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessments</h2>
            {assessmentsResult.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (assessmentsResult.data && assessmentsResult.data.length > 0) ? (
              <div className="space-y-3">
                {assessmentsResult.data.slice(0, 5).map((assessment: any) => (
                  <AssessmentItem key={assessment.id} assessment={assessment} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada assessments</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
