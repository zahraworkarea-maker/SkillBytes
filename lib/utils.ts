import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get current user ID from auth cookie
 * Returns the user ID if found, null otherwise
 */
export function getCurrentUserId(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  try {
    const authUser = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_user='));
    
    if (!authUser) {
      return null;
    }

    const decoded = decodeURIComponent(authUser.substring('auth_user='.length));
    const parsed = JSON.parse(decoded);
    
    // Return as string to match user_id from API
    return String(parsed?.id) || null;
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    return null;
  }
}

/**
 * Build full URL for an image stored in backend storage.
 * If `imagePath` is already a full URL, returns it as-is.
 * Example: imagePath = "questions/uuid/file.jpg" -> http://localhost:8000/storage/questions/uuid/file.jpg
 */
export function buildImageUrl(imagePath?: string | null) {
  if (!imagePath) return null

  try {
    // If already absolute URL, return
    const isAbsolute = imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/');
    if (isAbsolute) {
      // If it starts with '/', assume it's relative to host and return with base URL
      if (imagePath.startsWith('/')) {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        return `${base}${imagePath}`
      }
      return imagePath
    }

    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${base}/storage/${imagePath}`
  } catch (err) {
    return null
  }
}
