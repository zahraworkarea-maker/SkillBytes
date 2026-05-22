'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import UserService from '@/services/user.service';
import { apiHandler } from '@/lib/api-services';
import {
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  Search,
  Plus,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  profile_photo?: File;
}

interface SiswaUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  profile_photo?: string;
  created_at?: string;
  updated_at?: string;
}

export default function AddSiswaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const userService = UserService(apiHandler);

  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'siswa', // Default role
    profile_photo: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Table states
  const [siswaUsers, setSiswaUsers] = useState<SiswaUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SiswaUser[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaUser | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addFormDialogOpen, setAddFormDialogOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Check authorization - only guru and admin can access this page
  useEffect(() => {
    if (!isLoading && user) {
      const isAuthorized =
        user.role === 'admin' ||
        user.role_label === 'admin' ||
        user.role === 'guru' ||
        user.role_label === 'guru';
      if (!isAuthorized) {
        toast({
          title: 'Akses Ditolak',
          description: 'Hanya guru dan admin yang dapat mengakses halaman ini',
          variant: 'destructive',
        });
        router.push('/admin/dashboard');
      }
    }
  }, [user, isLoading, router, toast]);

  // Fetch siswa users on component mount
  useEffect(() => {
    fetchSiswaUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(siswaUsers);
    } else {
      const filtered = siswaUsers.filter(
        (siswa) =>
          siswa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          siswa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          siswa.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
    // Reset to page 1 when search term changes
    setCurrentPage(1);
  }, [searchTerm, siswaUsers]);

  const fetchSiswaUsers = async () => {
    try {
      setTableLoading(true);
      const response = await userService.retrieveAll({ role: 'siswa' });

      if (response.data) {
        const users = Array.isArray(response.data) ? response.data : response.data.data || [];
        // Ensure only users with role 'siswa' are displayed
        const siswaOnlyUsers = users.filter((user: SiswaUser) => user.role === 'siswa');
        setSiswaUsers(siswaOnlyUsers);
        setFilteredUsers(siswaOnlyUsers);
      }
    } catch (err: any) {
      console.error('Error fetching siswa users:', err);
      toast({
        title: 'Error',
        description: 'Failed to load siswa list',
        variant: 'destructive',
      });
    } finally {
      setTableLoading(false);
    }
  };

  const handleView = (siswa: SiswaUser) => {
    setSelectedSiswa(siswa);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      await userService.destroy(deleteId);

      toast({
        title: 'Success',
        description: 'Student account deleted successfully',
        variant: 'default',
      });

      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchSiswaUsers();
    } catch (err: any) {
      console.error('Error deleting siswa user:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete student account';

      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profile_photo: 'File size must be less than 2MB',
        }));
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          profile_photo: 'Only JPEG, PNG, JPG, and GIF formats are allowed',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_photo: file,
      }));

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.profile_photo) {
        setErrors((prev) => ({
          ...prev,
          profile_photo: '',
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create FormData for multipart/form-data
      const multipartFormData = new FormData();
      multipartFormData.append('name', formData.name);
      multipartFormData.append('email', formData.email);
      multipartFormData.append('username', formData.username);
      multipartFormData.append('password', formData.password);
      multipartFormData.append('role', formData.role);

      if (formData.profile_photo) {
        multipartFormData.append('profile_photo', formData.profile_photo);
      }

      // Call the create method from userService which uses FormData
      const response = await userService.create(multipartFormData);

      if (response.data) {
        toast({
          title: 'Success',
          description: 'Student account created successfully',
          variant: 'default',
        });

        // Reset form
        handleReset();

        // Close modal
        setAddFormDialogOpen(false);

        // Refresh table
        fetchSiswaUsers();
      }
    } catch (error: any) {
      console.error('Error creating siswa user:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create student account. Please try again.';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'siswa',
      profile_photo: undefined,
    });
    setPhotoPreview(null);
    setErrors({});
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Authorization Guard - Show loading while checking auth */}
      {isLoading && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying access...</p>
          </div>
        </div>
      )}

      {/* Only render content if user is authorized */}
      {!isLoading && user && (user.role === 'admin' || user.role_label === 'admin' || user.role === 'guru' || user.role_label === 'guru') && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600 mt-1">Manage all student (siswa) accounts in the system</p>
              </div>
              <Button
                onClick={() => setAddFormDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Student
              </Button>
            </div>

            {/* Table Section */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student List (Siswa)</CardTitle>
                    <CardDescription>All registered students in the system</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Search */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>

                {/* Table */}
            {tableLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading students...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'No students found matching your search' : 'No students registered yet'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setAddFormDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Student
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((siswa) => (
                      <TableRow key={siswa.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {siswa.profile_photo && (
                              <img
                                src={siswa.profile_photo}
                                alt={siswa.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <span>{siswa.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{siswa.email}</TableCell>
                        <TableCell className="text-gray-600">{siswa.username}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(siswa)}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClick(siswa.id)}
                              title="Delete student"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {filteredUsers.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} students
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      )}

      {/* Add Siswa Form Dialog */}
      <Dialog open={addFormDialogOpen} onOpenChange={setAddFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student (Siswa)</DialogTitle>
            <DialogDescription>
              Create a new student account with profile information
            </DialogDescription>
          </DialogHeader>

          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter student's full name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                className={`h-10 ${
                  errors.name ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className={`h-10 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                className={`h-10 ${
                  errors.username ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className={`h-10 ${
                  errors.password ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Role Field (Hidden - Always "siswa") */}
            <input type="hidden" name="role" value={formData.role} />
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Role is set to <strong>siswa</strong> by default
              </AlertDescription>
            </Alert>

            {/* Profile Photo Field */}
            <div className="space-y-2">
              <Label htmlFor="profile_photo" className="text-base font-semibold">
                Profile Photo
              </Label>
              <p className="text-sm text-gray-500">
                Max 2MB • Formats: JPEG, PNG, JPG, GIF
              </p>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="profile_photo"
                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        or drag and drop
                      </p>
                    </div>
                    <Input
                      id="profile_photo"
                      name="profile_photo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>

                {photoPreview && (
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-blue-400"
                    />
                  </div>
                )}
              </div>

              {errors.profile_photo && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.profile_photo}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating Student Account...' : 'Create Student Account'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleReset();
                  setAddFormDialogOpen(false);
                }}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>View complete student information</DialogDescription>
          </DialogHeader>

          {selectedSiswa && (
            <div className="space-y-4">
              {selectedSiswa.profile_photo && (
                <div className="flex justify-center">
                  <img
                    src={selectedSiswa.profile_photo}
                    alt={selectedSiswa.name}
                    className="w-24 h-24 rounded-lg object-cover border-2 border-blue-200"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <p className="text-gray-900 mt-1">{selectedSiswa.name}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-900 mt-1">{selectedSiswa.email}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Username</label>
                <p className="text-gray-900 mt-1">{selectedSiswa.username}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Role</label>
                <p className="mt-1">
                  <Badge className="bg-blue-600">siswa</Badge>
                </p>
              </div>

              {selectedSiswa.created_at && (
                <div>
                  <label className="text-sm font-semibold text-gray-700">Created At</label>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(selectedSiswa.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The student account will be permanently deleted from
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </>
    );
  }
