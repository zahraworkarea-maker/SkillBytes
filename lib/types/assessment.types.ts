/**
 * Assessment Types and Interfaces
 * Sesuai dengan API response format dari backend
 */

// ============= Basic Assessment Types =============

export interface AssessmentOption {
  id: string | number;
  label: string;
  text: string;
  is_correct?: boolean;
}

export interface AssessmentQuestion {
  id: string | number;
  question: string;
  options: AssessmentOption[];
  image_path?: string | null;
}

export interface Assessment {
  id: number;
  slug: string;
  title: string;
  description: string;
  time_limit: number;
  total_questions: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentLevel {
  id: number;
  level_number: number;
  name: string;
  description?: string;
  assessments: Assessment[];
  created_at: string;
  updated_at: string;
}

export interface AssessmentDetail {
  id: number;
  title: string;
  description: string;
  total_questions: number;
  time_limit: number;
  questions: AssessmentQuestion[];
}

export interface PaginationMeta {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

// ============= Assessment Attempt Types =============

export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'TIMEOUT';

export interface AssessmentAttempt {
  id: number;
  assessment_id: number;
  user_id: number;
  status: AttemptStatus;
  score?: number;
  correct_answers?: number;
  total_questions: number;
  started_at: string;
  completed_at?: string;
  time_limit: number;
  elapsed_time?: number;
}

export interface StartAssessmentResponse {
  success: boolean;
  data: {
    attempt_id: number;
    assessment: AssessmentDetail;
  };
}

export interface GetActiveAttemptResponse {
  success: boolean;
  data: {
    id: number;
    attempt_id?: number;
    assessment_id: number;
    user_id: number;
    status: AttemptStatus;
    started_at: string;
    time_limit: number;
  };
}

export interface SubmitAnswerPayload {
  question_id: number | string;
  selected_option_id: number | string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  message: string;
  data?: {
    attempt_id: number;
    question_id: number;
    is_saved: boolean;
  };
}

export interface FinishAssessmentResponse {
  success: boolean;
  data: {
    attempt_id: number;
    score: number;
    correct_answers: number;
    total_questions: number;
    percentage: number;
    status: 'COMPLETED' | 'TIMEOUT';
    completed_at: string;
  };
}

// ============= Assessment Result/History Types =============

export interface AssessmentResult {
  attempt_id: number;
  assessment_id: number;
  assessment_title: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  percentage: number;
  status: AttemptStatus;
  completed_at?: string;
  time_spent?: number;
}

// ============= Result Detail Types (from GET /results/{attemptId}) =============

export interface SelectedOption {
  id: string;
  label: string;
  text: string;
  is_correct: boolean;
}

export interface AnswerDetail {
  id: string;
  question_id: string;
  question_text: string;
  selected_option: SelectedOption;
  is_correct: boolean;
  explanation?: string | null;
}

export interface ResultDetail {
  id: string;
  assessment: Assessment;
  score: string; // From API as string like "100.00"
  status: AttemptStatus;
  correct_answers: number;
  total_questions: number;
  started_at: string;
  completed_at: string;
  answers: AnswerDetail[];
  // Computed properties for display
  assessment_title?: string;
  percentage?: number;
}

// ============= API Response Types =============

export interface AssessmentsResponse {
  success: boolean;
  data: Assessment[];
  pagination: PaginationMeta;
}

export interface AssessmentLevelsResponse {
  success: boolean;
  data: AssessmentLevel[];
  pagination?: PaginationMeta;
}

export interface AssessmentDetailResponse {
  success: boolean;
  data: AssessmentDetail;
}

export interface AssessmentResponse {
  success: boolean;
  data: Assessment;
}

export interface AssessmentResultsResponse {
  success: boolean;
  data: AssessmentResult[];
  pagination: PaginationMeta;
}

export interface AssessmentResultDetailResponse {
  success: boolean;
  data: ResultDetail;
}

// ============= Form Payload Types =============

export interface CreateAssessmentPayload {
  title: string;
  slug: string;
  description: string;
  time_limit: number;
  total_questions?: number;
  assessment_level_id?: number | string;
}

export interface UpdateAssessmentPayload {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  slug?: string;
  assessment_level_id?: number | string;
}

export type AssessmentFormPayload = Omit<CreateAssessmentPayload, 'id'> & {
  id?: number;
  slug: string;
};
