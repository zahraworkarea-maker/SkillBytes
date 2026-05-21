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

/**
 * Calculate days remaining from now to a deadline
 * @param deadline - ISO string or Date object representing the deadline
 * @returns Number of days remaining (can be negative if deadline has passed)
 */
export function calculateDaysRemaining(deadline?: string | Date | null): number {
  if (!deadline) return 0
  
  try {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    
    // Set time to 00:00:00 for both dates to count full days
    now.setHours(0, 0, 0, 0)
    deadlineDate.setHours(0, 0, 0, 0)
    
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  } catch (err) {
    console.error('Error calculating days remaining:', err)
    return 0
  }
}

/**
 * Format days remaining into a readable string
 * @param daysRemaining - Number of days remaining
 * @returns Formatted string (e.g., "Due today", "Due in 2 days", etc)
 */
export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining < 0) return 'Overdue'
  if (daysRemaining === 0) return 'Due today'
  if (daysRemaining === 1) return 'Due tomorrow'
  if (daysRemaining <= 7) return `Due in ${daysRemaining} days`
  if (daysRemaining <= 14) return `Due in ${Math.ceil(daysRemaining / 7)} week${Math.ceil(daysRemaining / 7) > 1 ? 's' : ''}`
  return `Due in ${Math.ceil(daysRemaining / 30)} month${Math.ceil(daysRemaining / 30) > 1 ? 's' : ''}`
}
