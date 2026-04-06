import { Lock, CheckCircle, Clock } from 'lucide-react'

interface Assessment {
  id: string
  title: string
  icon: React.ReactNode
  status: 'completed' | 'in-progress' | 'locked'
  description?: string
}

interface AssessmentCardProps {
  assessment: Assessment
  onStart: (assessment: Assessment) => void
  style?: 'colored' | 'white'
}

export function AssessmentCard({ assessment, onStart, style = 'colored' }: AssessmentCardProps) {
  const getStatusColor = () => {
    if (assessment.status === 'completed') {
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        statusText: 'text-green-600'
      }
    } else if (assessment.status === 'in-progress') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        statusText: 'text-blue-600'
      }
    } else {
      return {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        iconBg: 'bg-slate-100',
        iconText: 'text-slate-600',
        buttonBg: 'bg-slate-300 cursor-not-allowed',
        statusText: 'text-slate-400'
      }
    }
  }

  const colors = getStatusColor()

  const cardBaseClasses = style === 'colored'
    ? `${colors.bg} border ${colors.border}`
    : 'bg-white border border-slate-200'

  return (
    <div className={`${cardBaseClasses} rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in flex flex-col h-full min-h-[200px]`}>
      {/* Header Section */}
      <div className="mb-2">
        <div className="flex items-start gap-2 mb-2">
          <div className={`${colors.iconBg} rounded p-1.5 flex items-center justify-center flex-shrink-0`}>
            <div className={`${colors.iconText} w-4 h-4`}>
              {assessment.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
              {assessment.title}
            </h3>
            <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
              {assessment.description}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1">
          {assessment.status === 'completed' && (
            <>
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-base text-slate-900">Completed</p>
                <p className="text-xs text-slate-600">Completed on 20 April 2026</p>
              </div>
            </>
          )}
          {assessment.status === 'in-progress' && (
            <>
              <Clock className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" style={{ animationDuration: '3s' }} />
              <div className="min-w-0">
                <p className="font-semibold text-base text-slate-900">In Progress</p>
                <p className="text-xs text-slate-600">Currently doing...</p>
              </div>
            </>
          )}
          {assessment.status === 'locked' && (
            <>
              <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-base text-slate-900">Locked</p>
                <p className="text-xs text-slate-600">Complete previous assessments</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Button - Always at bottom */}
      <div className="mt-auto pt-2">
        {assessment.status === 'completed' ? (
          <button disabled className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 text-sm rounded-md transition-colors duration-200">
            View Results
          </button>
        ) : assessment.status === 'in-progress' ? (
          <button
            onClick={() => onStart(assessment)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 text-sm rounded-md transition-colors duration-200"
          >
            Resume
          </button>
        ) : (
          <button disabled className="w-full bg-slate-300 text-slate-500 font-semibold py-1.5 px-3 text-sm rounded-md cursor-not-allowed">
            Locked
          </button>
        )}
      </div>
    </div>
  )
}