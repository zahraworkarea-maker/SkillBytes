import { useCallback, useState } from 'react';

interface UseAssessmentStateOptions {
  totalQuestions: number;
}

export function useAssessmentState({ totalQuestions }: UseAssessmentStateOptions) {
  const [answers, setAnswers] = useState<Record<number | string, number | string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Select answer for a question
  const selectAnswer = useCallback(
    (questionId: number | string, optionId: number | string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));
    },
    []
  );

  // Get answer for a specific question
  const getAnswerForQuestion = useCallback(
    (questionId: number | string) => {
      return answers[questionId];
    },
    [answers]
  );

  // Check if question is answered
  const isQuestionAnswered = useCallback(
    (questionId: number | string) => {
      return questionId in answers;
    },
    [answers]
  );

  // Check if all questions are answered
  const areAllQuestionsAnswered = useCallback(() => {
    const questionIds = Array.from({ length: totalQuestions }, (_, i) =>
      String(i + 1)
    );
    return questionIds.every((id) => id in answers || answers[parseInt(id) - 1]);
  }, [answers, totalQuestions]);

  // Get count of answered questions
  const getAnsweredCount = useCallback(() => {
    return Object.keys(answers).length;
  }, [answers]);

  // Move to next question
  const goToNextQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      prev < totalQuestions - 1 ? prev + 1 : prev
    );
  }, [totalQuestions]);

  // Move to previous question
  const goToPreviousQuestion = useCallback(() => {
    setCurrentQuestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Jump to specific question
  const jumpToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalQuestions) {
        setCurrentQuestionIndex(index);
      }
    },
    [totalQuestions]
  );

  // Clear all answers (reset state)
  const clearAnswers = useCallback(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
  }, []);

  // Save all answers to localStorage as draft (optional backup)
  const saveDraftToLocalStorage = useCallback((attemptId: string) => {
    try {
      localStorage.setItem(
        `assessment_draft_${attemptId}`,
        JSON.stringify({
          answers,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [answers]);

  // Load draft from localStorage (optional recovery)
  const loadDraftFromLocalStorage = useCallback((attemptId: string) => {
    try {
      const draft = localStorage.getItem(`assessment_draft_${attemptId}`);
      if (draft) {
        const { answers: draftAnswers } = JSON.parse(draft);
        setAnswers(draftAnswers);
        return true;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return false;
  }, []);

  // Clear draft from localStorage
  const clearDraftFromLocalStorage = useCallback((attemptId: string) => {
    try {
      localStorage.removeItem(`assessment_draft_${attemptId}`);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  return {
    answers,
    currentQuestionIndex,
    isSubmitting,
    setIsSubmitting,
    selectAnswer,
    getAnswerForQuestion,
    isQuestionAnswered,
    areAllQuestionsAnswered,
    getAnsweredCount,
    goToNextQuestion,
    goToPreviousQuestion,
    jumpToQuestion,
    clearAnswers,
    saveDraftToLocalStorage,
    loadDraftFromLocalStorage,
    clearDraftFromLocalStorage,
  };
}
