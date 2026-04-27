'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { userService, courseService, assessmentService } from '@/lib/api-services';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';

export default function DashboardExample() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Jika belum login, redirect ke login page
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch data jika sudah login
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          setError('');
          
          // Fetch semua data secara parallel
          const [usersRes, coursesRes, assessmentsRes] = await Promise.all([
            userService.getAllUsers(),
            courseService.getAllCourses(),
            assessmentService.getAllAssessments(),
          ]);

          setUsers(usersRes.data || usersRes);
          setCourses(coursesRes.data || coursesRes);
          setAssessments(assessmentsRes.data || assessmentsRes);
        } catch (err: any) {
          console.error('Fetch data error:', err);
          setError('Gagal memuat data dari server');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isAuthenticated, authLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return null; // redirect in useEffect
  }

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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : users.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : courses.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Assessments</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {loading ? <Skeleton className="h-8 w-16" /> : assessments.length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <section className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Users List</h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : users.length > 0 ? (
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
                    {users.slice(0, 5).map((usr: any) => (
                      <tr key={usr.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{usr.id}</td>
                        <td className="px-4 py-2">{usr.name}</td>
                        <td className="px-4 py-2">{usr.email}</td>
                      </tr>
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
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.slice(0, 4).map((course: any) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                  </div>
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
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : assessments.length > 0 ? (
              <div className="space-y-3">
                {assessments.slice(0, 5).map((assessment: any) => (
                  <div key={assessment.id} className="border rounded-lg p-4 hover:shadow-md transition">
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
