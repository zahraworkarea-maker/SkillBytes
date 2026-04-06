import { Lock, CheckCircle, Clock } from 'lucide-react'

interface AssessmentLevel {
  id: number
  levelNumber: number
  title: string
  description: string
  icon: React.ReactNode
  assessments: any[]
  bgColor?: string
}

interface SKKNILevelCardProps {
  level: AssessmentLevel
  style?: 'colored' | 'white'
}

export function SKKNILevelCard({ level, style = 'colored' }: SKKNILevelCardProps) {
  const cardClasses = style === 'colored'
    ? `${level.bgColor} rounded-xl p-6 border-2 border-white shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in hover:scale-105 h-50`
    : `bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in hover:scale-105 h-50`

  return (
    <div className={`${cardClasses} flex flex-col justify-between`}>
      <div className="flex items-start gap-4 mb-4 shrink-0">
        <div className={`p-3 rounded-lg ${
          level.bgColor === 'bg-green-50'
            ? 'bg-green-100 text-green-600'
            : level.bgColor === 'bg-blue-50'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-purple-100 text-purple-600'
        } shrink-0`}>
          {level.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">
            {level.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {level.description}
          </p>
        </div>
      </div>

      {/* Status Badge and Description */}
      <div className="flex items-start gap-2 shrink-0">
        {level.levelNumber === 1 && (
          <>
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Completed</p>
              <p className="text-xs text-slate-600">Completed on 20 April 2026</p>
            </div>
          </>
        )}
        {level.levelNumber === 2 && (
          <>
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">In Progress</p>
              <p className="text-xs text-slate-600">Currently doing...</p>
            </div>
          </>
        )}
        {level.levelNumber === 3 && (
          <>
            <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Locked</p>
              <p className="text-xs text-slate-600">Reach Level 2 to unlock this level</p>
            </div>
          </>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-end mt-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            level.levelNumber === 3
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={level.levelNumber === 3}
        >
          {level.levelNumber === 1 ? 'Start' : level.levelNumber === 2 ? 'Resume' : 'Disabled'}
        </button>
      </div>
    </div>
  )
}