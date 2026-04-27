'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

// ✅ TAMBAHAN: Tambahkan onComplete di interface
interface TimerCountdownProps {
  lessonId: string
  totalSeconds?: number
  durationMinutes?: number
  onComplete?: () => void
}

// ✅ TAMBAHAN: Masukkan onComplete ke parameter komponen
export function TimerCountdown({ lessonId, totalSeconds, durationMinutes, onComplete }: TimerCountdownProps) {
  // Konversi durationMinutes ke totalSeconds jika diberikan
  const finalTotalSeconds = durationMinutes ? durationMinutes * 60 : (totalSeconds || 25 * 60)
  const [timeLeft, setTimeLeft] = useState<number>(finalTotalSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const storageKey = `timer_${lessonId}`

  // Load timer dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)

    if (saved) {
      const { time } = JSON.parse(saved)
      setTimeLeft(time)
    } else {
      // Set initial time dari finalTotalSeconds jika tidak ada saved
      setTimeLeft(finalTotalSeconds)
    }
    
    // SELALU auto-play saat kembali ke page (jangan cek isPaused dari localStorage)
    setIsRunning(true)
    setIsPaused(false)
  }, [lessonId, storageKey, finalTotalSeconds])

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1)
        // Save to localStorage setiap detik dengan status running
        localStorage.setItem(storageKey, JSON.stringify({
          time: newTime,
          isPaused: false,
          timestamp: Date.now()
        }))
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, lessonId, storageKey])

  // ✅ TAMBAHAN: Effect khusus untuk memanggil onComplete saat waktu habis
  useEffect(() => {
    if (timeLeft === 0 && onComplete) {
      onComplete()
    }
  }, [timeLeft, onComplete])

  // Handle visibility change (pause saat tab tidak aktif, resume saat aktif)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Simpan state paused saat tab hidden
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const { time } = JSON.parse(saved)
          localStorage.setItem(storageKey, JSON.stringify({
            time: time,
            isPaused: true,
            timestamp: Date.now()
          }))
        }
        setIsRunning(false)
        setIsPaused(true)
      } else {
        // Resume saat tab aktif kembali
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const { time } = JSON.parse(saved)
          localStorage.setItem(storageKey, JSON.stringify({
            time: time,
            isPaused: false,
            timestamp: Date.now()
          }))
        }
        setIsRunning(true)
        setIsPaused(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [lessonId, storageKey])

  // Pause timer saat user keluar dari halaman
  useEffect(() => {
    const pauseTimer = () => {
      // Simpan state paused ke localStorage
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const { time } = JSON.parse(saved)
        localStorage.setItem(storageKey, JSON.stringify({
          time: time,
          isPaused: true,
          timestamp: Date.now()
        }))
      }
    }

    const handleBeforeUnload = () => {
      pauseTimer()
    }

    // Capture semua link clicks
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && !link.href.includes(`/materi/${lessonId}`)) {
        pauseTimer()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [lessonId, storageKey])

  // Format waktu
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isCompleted = timeLeft === 0

  return (
    <div className="mb-8 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">Waktu Membaca Materi</p>
            <p className="text-4xl font-bold text-blue-900">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        <div className="text-right">
          {isCompleted ? (
            <div className="inline-block px-4 py-2 bg-green-100 rounded-lg border border-green-300">
              <p className="text-sm font-bold text-green-700">✓ Waktu Habis</p>
              <p className="text-xs text-green-600 mt-1">Anda siap melanjutkan</p>
            </div>
          ) : isPaused ? (
            <div className="inline-block px-4 py-2 bg-orange-100 rounded-lg border border-orange-300">
              <p className="text-sm font-bold text-orange-700">⏸ Timer Ter-pause</p>
              <p className="text-xs text-orange-600 mt-1">Kembali untuk lanjut</p>
            </div>
          ) : (
            <div className="inline-block px-4 py-2 bg-amber-100 rounded-lg border border-amber-300">
              <p className="text-sm font-bold text-amber-700">⏳ Membaca...</p>
              <p className="text-xs text-amber-600 mt-1">Lanjutkan membaca</p>
            </div>
          )}
        </div>
      </div>

      {isPaused && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
          ⏸ Timer ter-pause saat Anda meninggalkan halaman ini. Kembali ke halaman untuk melanjutkan timer.
        </div>
      )}
    </div>
  )
}