'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Clock, CheckCircle2, AlertCircle, Upload, X, Loader } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { usePBLCase } from '@/hooks/use-pbl-case';
import { pblService } from '@/lib/api-services';
import styles from './pbl-content.module.css';
import { PBLCase, PBLStatus } from '@/lib/types/pbl.types';

export default function PBLDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  // Fetch data from backend
  const { caseData, sections, loading, error } = usePBLCase(slug);
  
  const [isStarted, setIsStarted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if case was already started
    if (caseData) {
      const savedStatus = localStorage.getItem(`pbl_${slug}_started`);
      if (savedStatus) {
        setIsStarted(true);
      }
    }
  }, [caseData, slug]);

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      Array.from(files).forEach((file) => {
        setUploadedFiles((prev) => [...prev, file]);
      });
      // Reset input value so the same file can be selected again
      e.currentTarget.value = '';
    }
  };

  const handleStartCase = () => {
    localStorage.setItem(`pbl_${slug}_started`, JSON.stringify({
      startedAt: new Date().toISOString(),
      status: 'in-progress',
    }));
    setIsStarted(true);
  };

  const handleSubmitPBL = async () => {
    if (!caseData || uploadedFiles.length === 0) {
      setSubmitError('Silakan pilih file untuk dikumpulkan');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('case_id', caseData.id.toString());
      
      // Add all uploaded files
      uploadedFiles.forEach((file) => {
        formData.append('submission_file', file);
      });

      // Submit to backend
      const response = await pblService.submitPBL(caseData.id, formData);

      console.log('Submission response:', response);
      setSubmitSuccess(true);
      setUploadedFiles([]);

      // Show success message
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirimkan jawaban';
      setSubmitError(errorMessage);
      console.error('Error submitting PBL:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRandomImage = () => {
    const images = [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f70d504c0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712913-0f18e5e5c1d1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712023-ba7c9b5c5f0e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return 'Waktu habis';
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} Hari`);
    if (hours > 0) parts.push(`${hours} Jam`);
    if (minutes > 0) parts.push(`${minutes} Menit`);

    return parts.length > 0 ? parts.join(' ') : 'Kurang dari 1 menit';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Memuat PBL Case...</h1>
          <p className="text-slate-600">Tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Case Tidak Ditemukan</h1>
            <p className="text-slate-600 mb-6">
              {error ? error.message : 'Case yang Anda cari tidak tersedia'}
            </p>
            <Link href="/pbl">
              <Button>Kembali ke PBL</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    'Beginner': 'bg-cyan-100 text-cyan-700',
    'Intermediate': 'bg-green-100 text-green-700',
    'Advanced': 'bg-amber-100 text-amber-700',
    'Expert': 'bg-purple-100 text-purple-700',
    'Master': 'bg-pink-100 text-pink-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Link href="/pbl" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">Case #{caseData.case_number}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Case Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Image Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative w-full aspect-square bg-linear-to-br from-slate-200 to-slate-100">
                  <img
                    src={getRandomImage()}
                    alt={caseData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
                </div>

                {/* Case Info */}
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 line-clamp-2 mb-2">
                      Case #{caseData.case_number}
                    </h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      levelColors[caseData.pbl_level?.name] || 'bg-slate-100 text-slate-700'
                    }`}>
                      {caseData.pbl_level?.name || 'Unknown'}
                    </span>
                  </div>

                  {/* Start Button */}
                  <Button
                    onClick={handleStartCase}
                    disabled={isStarted}
                    className="w-full"
                  >
                    <Play className="w-4 h-4" />
                    {isStarted ? 'Sudah Dikumpulkan' : 'Kumpulkan PBL'}
                  </Button>

                  {/* Status Section */}
                  <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold text-slate-700 text-sm">Status</h3>

                    {/* Progress Status */}
                    <div className="flex items-center gap-3">
                      {getStatusIcon(caseData.status)}
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Progres</p>
                        <p className="text-sm font-medium text-slate-900 capitalize">
                          {caseData.status === 'completed' && 'Selesai'}
                          {caseData.status === 'in-progress' && 'Sedang Berlangsung'}
                          {caseData.status === 'not-started' && 'Belum Dimulai'}
                        </p>
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Deadline</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(caseData.deadline).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Case Explanation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Description Card */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                {caseData.title}
              </h1>
              <p className="text-slate-600 text-lg mb-4">
                {caseData.description}
              </p>
              <div className="flex items-center gap-2 text-slate-500 text-sm bg-blue-50 w-fit px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{getTimeRemaining(caseData.deadline)}</span>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <div className={styles.contentArea}>
                {sections && sections.length > 0 ? (
                  <div className="space-y-6">
                    {sections.map((section) => (
                      <div key={section.id}>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">
                          {section.title}
                        </h3>
                        <div className="space-y-4">
                          {section.items && section.items.map((item) => (
                            <div key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                              {item.type === 'text' && (
                                <p className="text-slate-700 whitespace-pre-wrap">{item.content}</p>
                              )}
                              {item.type === 'image' && item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt="Section content"
                                  className="max-w-full h-auto rounded"
                                />
                              )}
                              {item.type === 'video' && item.content && (
                                <div className="aspect-video bg-slate-900 rounded">
                                  <iframe
                                    src={item.content}
                                    className="w-full h-full rounded"
                                    allowFullScreen
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">Tidak ada konten untuk case ini</p>
                )}
              </div>
            </div>

            {/* File Upload Section Card */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Kumpulkan Jawaban</h3>
              
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}

              {submitSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm font-medium">✓ Jawaban berhasil dikumpulkan!</p>
                </div>
              )}
              
              {/* Dropzone Area */}
              <div 
                ref={dropzoneRef}
                onClick={() => fileInputRef.current?.click()}
                className="dropzone border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 cursor-pointer bg-slate-50 group"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <Upload className="w-12 h-12 text-blue-400 mb-3 group-hover:text-blue-600 transition-colors" />
                  <p className="text-slate-700 font-medium group-hover:text-blue-700 transition-colors">Seret file di sini atau klik untuk memilih</p>
                  <p className="text-slate-500 text-sm mt-1">Maksimal 50MB • PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP</p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900 mb-3">File yang Diupload</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Upload className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(file.name)}
                          className="p-2 hover:bg-red-100 rounded transition-colors shrink-0"
                          title="Hapus file"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={handleSubmitPBL}
                  disabled={isSubmitting || uploadedFiles.length === 0}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Mengirim...
                    </>
                  ) : (
                    'Jawab Case'
                  )}
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  Simpan Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
