'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { AnswerDetail } from '@/lib/types/assessment.types';

interface AnswerReviewProps {
  questionNumber: number;
  answer: AnswerDetail;
}

export function AnswerReview({ questionNumber, answer }: AnswerReviewProps) {
  const isCorrect = answer.is_correct;

  return (
    <div className="bg-white rounded-lg border-2 p-6 mb-4 transition-all duration-300" 
         style={{
           borderColor: isCorrect ? '#22c55e' : '#ef4444',
           backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2'
         }}>
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-semibold text-gray-600">
              Soal {questionNumber}
            </span>
            {isCorrect ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Benar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <XCircle className="w-4 h-4" />
                Salah
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {answer.question_text}
          </h3>
        </div>
      </div>

      {/* Selected Answer */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-3">Jawaban Anda:</p>
        <div className="p-4 border-2 rounded-lg" 
             style={{
               borderColor: isCorrect ? '#22c55e' : '#ef4444',
               backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2'
             }}>
          <div className="flex items-start gap-4">
            <div className="pt-1 flex-shrink-0">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{answer.selected_option.text}</p>
              <p className="text-sm text-gray-600 mt-1">
                Pilihan {answer.selected_option.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      {answer.explanation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-1">Penjelasan:</p>
          <p className="text-sm text-blue-800">{answer.explanation}</p>
        </div>
      )}
    </div>
  );
}
