import React from 'react';

interface QuestionProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

export function QuestionProgress({
  currentQuestion,
  totalQuestions,
  answeredCount,
}: QuestionProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Soal <span className="font-bold text-gray-900">{currentQuestion}</span> dari{' '}
          <span className="font-bold text-gray-900">{totalQuestions}</span>
        </span>
        <span className="text-gray-600">
          Terjawab: <span className="font-bold text-green-600">{answeredCount}</span> soal
        </span>
      </div>
    </div>
  );
}
