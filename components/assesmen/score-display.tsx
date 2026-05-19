import React from 'react';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  status: 'COMPLETED' | 'TIMEOUT' | 'IN_PROGRESS';
}

export function ScoreDisplay({
  score,
  totalQuestions,
  correctAnswers,
  percentage,
  status,
}: ScoreDisplayProps) {
  const getStatusStyles = () => {
    if (status === 'TIMEOUT') {
      return {
        icon: <AlertCircle className="w-20 h-20 text-yellow-500" />,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        statusText: 'WAKTU HABIS',
      };
    }

    if (percentage >= 75) {
      return {
        icon: <CheckCircle className="w-20 h-20 text-green-500" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        statusText: 'LUAR BIASA!',
      };
    }

    if (percentage >= 50) {
      return {
        icon: <CheckCircle className="w-20 h-20 text-blue-500" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        statusText: 'BAGUS!',
      };
    }

    return {
      icon: <Zap className="w-20 h-20 text-orange-500" />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      statusText: 'PERLU LATIHAN LAGI',
    };
  };

  const styles = getStatusStyles();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      {/* Status Icon */}
      <div className="flex justify-center">{styles.icon}</div>

      {/* Status Text */}
      <div className={`text-center px-6 py-3 rounded-lg ${styles.bgColor}`}>
        <p className={`text-sm font-semibold ${styles.textColor}`}>{styles.statusText}</p>
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-900">{score}</div>
        <div className="text-2xl text-gray-600 mt-2">Score</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
          <div className="text-sm text-gray-600 mt-1">Jawaban Benar</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
          <div className="text-sm text-gray-600 mt-1">Jawaban Salah</div>
        </div>
      </div>

      {/* Percentage */}
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Persentase</span>
          <span className="text-sm font-bold text-gray-900">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
