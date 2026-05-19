'use client';

import React from 'react';
import { CheckCircle, XCircle, Circle } from 'lucide-react';
import { AssessmentOption, AssessmentQuestion } from '@/lib/types/assessment.types';

interface QuizQuestionProps {
  question: AssessmentQuestion;
  selectedOptionId?: number | string;
  correctOptionId?: number | string;
  showCorrectAnswer?: boolean;
  isAnswered?: boolean;
  isSubmitting?: boolean;
  onSelectOption: (optionId: number | string) => void;
  disabled?: boolean;
}

export function QuizQuestion({
  question,
  selectedOptionId,
  correctOptionId,
  showCorrectAnswer = false,
  isAnswered = false,
  isSubmitting = false,
  onSelectOption,
  disabled = false,
}: QuizQuestionProps) {
  const handleOptionClick = (optionId: number | string) => {
    if (!disabled && !isSubmitting) {
      onSelectOption(optionId);
    }
  };

  const getOptionStyles = (option: AssessmentOption) => {
    const isSelected = selectedOptionId === option.id;
    const isCorrect = correctOptionId === option.id;

    let baseClasses = 'relative p-4 border-2 rounded-lg transition-all duration-300 cursor-pointer';

    if (disabled) {
      baseClasses += ' cursor-not-allowed opacity-75';
    }

    if (showCorrectAnswer) {
      if (isCorrect) {
        return `${baseClasses} border-green-500 bg-green-50`;
      } else if (isSelected && !isCorrect) {
        return `${baseClasses} border-red-500 bg-red-50`;
      } else {
        return `${baseClasses} border-slate-200 bg-slate-50`;
      }
    }

    if (isSelected) {
      return `${baseClasses} border-blue-600 bg-blue-50`;
    }

    return `${baseClasses} border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50`;
  };

  const getStatusIcon = (option: AssessmentOption) => {
    const isSelected = selectedOptionId === option.id;
    const isCorrect = correctOptionId === option.id;

    if (!showCorrectAnswer) {
      if (isSelected) {
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      }
      return <Circle className="w-5 h-5 text-slate-400" />;
    }

    if (isCorrect) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    if (isSelected && !isCorrect) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }

    return <Circle className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{question.question}</h2>

        {/* Answer status indicator */}
        {isAnswered && !showCorrectAnswer && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700">Pertanyaan ini sudah dijawab</span>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option: AssessmentOption) => (
          <button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={disabled || isSubmitting}
            className={getOptionStyles(option)}
          >
            <div className="flex items-start gap-4">
              <div className="pt-1 flex-shrink-0">{getStatusIcon(option)}</div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">{option.text}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Pilihan {option.label}
                </p>
              </div>
              {isSubmitting && selectedOptionId === option.id && (
                <div className="flex-shrink-0 pt-1">
                  <div className="animate-spin">
                    <Circle className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Submission indicator */}
      {isSubmitting && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="animate-spin">
            <Circle className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm text-blue-700">Mengirim jawaban...</span>
        </div>
      )}
    </div>
  );
}
