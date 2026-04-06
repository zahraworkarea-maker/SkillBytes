import { Clock, BookMarked, AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInView } from '@/hooks/use-in-view'

export function ContinueLearning() {
  const { ref, isInView } = useInView()

  return (
    <div ref={ref} className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100 animate-slide-up-delay-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4" style={{
        animation: isInView ? 'fadeIn 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        opacity: isInView ? 1 : 0,
      }}>
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
            <circle cx="22" cy="25" r="16" fill="#3b82f6" />
            <circle cx="7" cy="13" r="5.5" fill="#3b82f6" />
            <circle cx="37" cy="13" r="5.5" fill="#3b82f6" />
            <circle cx="7" cy="13" r="3.5" fill="#93c5fd" />
            <circle cx="37" cy="13" r="3.5" fill="#93c5fd" />
            <rect x="10" y="18" width="10" height="8" rx="4" fill="white" />
            <rect x="24" y="18" width="10" height="8" rx="4" fill="white" />
            <circle cx="15" cy="22" r="3" fill="#1d4ed8" />
            <circle cx="29" cy="22" r="3" fill="#1d4ed8" />
            <rect x="20" y="20" width="4" height="4" rx="1" fill="#bfdbfe" />
            <path d="M 16 32 Q 22 37 28 32" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-800 text-sm md:text-base">Continue Learning</h3>
      </div>

      {/* Active Lesson Card */}
      <div className="bg-slate-50 rounded-xl p-3 md:p-4 mb-5 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
            <BookMarked className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm md:text-base font-semibold text-gray-800">BAB 2: OOP - Inheritance</p>
        </div>
        <div className="h-2 mb-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-blue-500 rounded-full transition-all ${isInView ? 'animate-progress-fill' : 'w-0'}`}
            style={{ width: isInView ? '45%' : '0%', transition: 'width 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          />
        </div>
        <p className="text-xs md:text-sm text-blue-500 font-semibold text-right mb-3">45%</p>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs md:text-sm">Deadline: 12 hari Lagi</span>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-4 md:px-5 h-8 rounded-lg w-full md:w-auto">
            Lanjutkan
          </Button>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 text-sm md:text-base mb-3 sticky top-0 bg-white pb-2">Upcoming Deadlines</h3>
        <div className="space-y-2.5">
        {/* Deadline 1 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg border border-gray-100 bg-white">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-800">
              <span className="text-blue-600">Assesmen:</span> Final Test OOP
            </p>
            <p className="text-xs text-gray-400">Online multiple-choice exam</p>
          </div>
          <span className="text-xs bg-red-100 text-red-500 font-semibold px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap self-start md:self-center">
            Due in 4 days
          </span>
        </div>

        {/* Deadline 2 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg border border-gray-100 bg-white">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-semibold text-gray-800">
              <span className="text-blue-600">Problem-Based Learning:</span> Problem Solving
            </p>
            <p className="text-xs text-gray-400">Upload your file</p>
          </div>
          <span className="text-xs bg-orange-100 text-orange-500 font-semibold px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap self-start md:self-center">
            Due in 2 weeks
          </span>
        </div>
        </div>
      </div>
    </div>
  )
}
