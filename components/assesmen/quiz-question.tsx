'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Circle,
} from 'lucide-react';

import {
  AssessmentOption,
  AssessmentQuestion,
} from '@/lib/types/assessment.types';

// Helper function to validate image path
const isValidImagePath = (imagePath?: string | null): boolean => {
  if (!imagePath || typeof imagePath !== 'string') return false;
  // Accept full URL, absolute path (/foo.jpg), and backend relative path (questions/foo.jpg)
  const normalizedPath = imagePath.trim();
  return normalizedPath.length > 0;
};

const buildQuestionImageUrl = (imagePath?: string | null): string | null => {
  if (!isValidImagePath(imagePath)) return null;

  const normalizedPath = String(imagePath).trim();

  if (normalizedPath.includes('://')) {
    return normalizedPath;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_IMAGE_URL || '').trim();
  if (!baseUrl) {
    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = normalizedPath.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
};

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
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(
    () => buildQuestionImageUrl(question.image_path),
    [question.image_path]
  );

  useEffect(() => {
    setImageError(false);
  }, [question.id, question.image_path]);

  const handleOptionClick = (
    optionId: number | string
  ) => {
    if (!disabled && !isSubmitting) {
      onSelectOption(optionId);
    }
  };

  const getOptionStyles = (
    option: AssessmentOption
  ) => {
    const isSelected =
      selectedOptionId === option.id;

    const isCorrect =
      correctOptionId === option.id;

    let classes =
      'w-full rounded-2xl border-2 p-5 transition-all duration-200 text-left group';

    if (disabled) {
      classes += ' opacity-70 cursor-not-allowed';
    } else {
      classes += ' cursor-pointer';
    }

    // RESULT MODE
    if (showCorrectAnswer) {
      if (isCorrect) {
        return `${classes} border-green-500 bg-green-50`;
      }

      if (isSelected && !isCorrect) {
        return `${classes} border-red-500 bg-red-50`;
      }

      return `${classes} border-gray-200 bg-white`;
    }

    // SELECTED
    if (isSelected) {
      return `${classes} border-blue-600 bg-blue-50 shadow-md`;
    }

    // DEFAULT
    return `${classes} border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm`;
  };

  const getIcon = (
    option: AssessmentOption
  ) => {
    const isSelected =
      selectedOptionId === option.id;

    const isCorrect =
      correctOptionId === option.id;

    if (showCorrectAnswer) {
      if (isCorrect) {
        return (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        );
      }

      if (isSelected && !isCorrect) {
        return (
          <XCircle className="w-5 h-5 text-red-600" />
        );
      }

      return (
        <Circle className="w-5 h-5 text-gray-300" />
      );
    }

    if (isSelected) {
      return (
        <CheckCircle2 className="w-5 h-5 text-blue-600" />
      );
    }

    return (
      <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-400" />
    );
  };

  return (
    <div className="space-y-8">

      {/* Question */}
      <div>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
            ?
          </div>

          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed">
              {question.question}
            </h2>

            {isAnswered &&
              !showCorrectAnswer && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />

                  <span className="text-sm font-medium text-green-700">
                    Jawaban tersimpan
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Question Image */}
        {!imageError && imageUrl && (
          <div className="mt-6 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={imageUrl}
              alt={question.question}
              className="w-full h-auto max-h-96 object-contain"
              onError={() => {
                console.warn(`⚠️ Failed to load image for question ${question.id}: ${question.image_path}`);
                setImageError(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-4">
        {question.options.map(
          (option: AssessmentOption, index) => {
            const isSelected =
              selectedOptionId === option.id;

            return (
              <button
                key={option.id}
                onClick={() =>
                  handleOptionClick(option.id)
                }
                disabled={
                  disabled || isSubmitting
                }
                className={getOptionStyles(option)}
              >
                <div className="flex items-start gap-4">

                  {/* Label */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all
                      ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {String.fromCharCode(
                      65 + index
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium leading-relaxed">
                      {option.text}
                    </p>
                  </div>

                  {/* Icon */}
                  <div className="pt-1">
                    {getIcon(option)}
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* Loading */}
      {isSubmitting && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

          <span className="text-sm font-medium text-blue-700">
            Mengirim jawaban...
          </span>
        </div>
      )}
    </div>
  );
}