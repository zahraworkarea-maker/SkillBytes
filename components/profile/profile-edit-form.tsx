'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { userService } from '@/lib/api-services'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function ProfileEditForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const profilePhotoUrl = user?.profile_photo_url
    ? `${'http://localhost:8000'}${user.profile_photo_url}`
    : null

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    // Create preview URL and store file
    const preview = URL.createObjectURL(file)
    setPreviewUrl(preview)
    setSelectedFile(file)
  }

  const handleSave = async () => {
    if (!selectedFile) return

    try {
      setIsLoading(true)

      // Upload photo dengan field name yang sesuai backend
      const formData = new FormData()
      formData.append('profile_photo', selectedFile)

      console.log('[PROFILE] Uploading file:', selectedFile.name, selectedFile.size, selectedFile.type)

      const response = await userService.updateUser(user.id, formData)

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Profile photo updated successfully',
          variant: 'default',
        })

        // Reload user data or redirect
        setTimeout(() => {
          router.refresh()
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update profile photo',
        variant: 'destructive',
      })
      setPreviewUrl('')
      setSelectedFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Profile Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit Profile</h1>
        <p className="text-gray-600 text-sm mb-8">Update your profile photo</p>

        {/* Photo Upload Section */}
        <div className="mb-8">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-4">Profile Photo</p>

            {/* Photo Container */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 flex items-center justify-center relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Current profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Upload Button Overlay */}
                <button
                  onClick={handlePhotoClick}
                  disabled={isLoading || !!previewUrl}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-200 rounded-full ${
                    previewUrl
                      ? 'bg-black bg-opacity-30'
                      : 'bg-black bg-opacity-0 group-hover:bg-opacity-40'
                  }`}
                >
                  <div
                    className={`p-2 rounded-full transition-all duration-200 ${
                      previewUrl
                        ? 'bg-white bg-opacity-50'
                        : 'bg-white bg-opacity-80 group-hover:bg-opacity-100'
                    }`}
                  >
                    <Camera className="w-6 h-6 text-gray-700" />
                  </div>
                </button>

                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />

            {/* Instructions */}
            <p className="text-xs text-gray-500 text-center">
              Click on the photo to change it. Max size: 5MB (JPG, PNG, GIF)
            </p>
          </div>
        </div>

        {/* User Info Display */}
        <div className="border-t pt-6">
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
            <p className="text-lg font-semibold text-gray-800">{user.name}</p>
          </div>
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p className="text-lg font-semibold text-gray-800">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
            <p className="text-lg font-semibold text-gray-800">
              {(user.role_label || user.role || '-').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t mt-6 pt-6 flex gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          {previewUrl && (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!previewUrl || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
