// PBL Case Types
export type PBLStatus = 'not-started' | 'in-progress' | 'completed';
export type PBLItemType = 'text' | 'image' | 'video' | 'file';

export interface PBLLevel {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PBLCase {
  id: number;
  slug: string;
  case_number: number;
  title: string;
  pbl_level_id: number;
  description: string;
  image_url: string | null;
  time_limit: number;
  start_date: string;
  deadline: string;
  pbl_level: PBLLevel;
  status: PBLStatus;
  created_at: string;
  updated_at: string;
}

export interface PBLCaseCreateRequest {
  case_number: number;
  title: string;
  pbl_level_id: number;
  description: string;
  image_url?: string | null;
  time_limit: number;
  start_date: string;
  deadline: string;
  status?: PBLStatus;
}

export interface PBLCaseUpdateRequest {
  case_number?: number;
  title?: string;
  pbl_level_id?: number;
  description?: string;
  image_url?: string | null;
  time_limit?: number;
  start_date?: string;
  deadline?: string;
  status?: PBLStatus;
}

// PBL Case List Response (Paginated)
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PBLCaseListResponse {
  current_page: number;
  data: PBLCase[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PBLCaseResponse {
  message: string;
  data: PBLCase;
}

// PBL Section Types
export interface PBLSectionItem {
  id: number;
  type: PBLItemType;
  content: string | null;
  image_url: string | null;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PBLSection {
  id: number;
  title: string;
  order: number;
  items: PBLSectionItem[];
  created_at?: string;
  updated_at?: string;
}

export interface PBLSectionCreateRequest {
  title: string;
  order?: number;
}

export interface PBLSectionUpdateRequest {
  title?: string;
  order?: number;
}

export interface PBLSectionListResponse extends Array<PBLSection> {}

export interface PBLSectionResponse {
  message: string;
  data: PBLSection;
}

// PBL Section Item Types
export interface PBLSectionItemCreateRequest {
  type: PBLItemType;
  content?: string;
  image_url?: string | null;
  order?: number;
}

export interface PBLSectionItemUpdateRequest {
  type?: PBLItemType;
  content?: string;
  image_url?: string | null;
  order?: number;
}

export interface PBLSectionItemResponse {
  message: string;
  data: {
    id: number;
    type: PBLItemType;
    content: string | null;
    image_url: string | null;
    order: number;
  };
}

// Generic API Response
export interface APIResponse<T> {
  message: string;
  data: T;
}

export interface APIListResponse<T> extends Array<T> {}

// PBL Submission Types
export interface PBLSubmission {
  id: number;
  case_id: number;
  user_id: number;
  answer: string | null;
  submission_file: string | null;
  submission_file_path: string | null;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface PBLSubmissionCreateRequest {
  case_id: number;
  answer?: string;
  submission_file?: File;
}

export interface PBLSubmissionResponse {
  message: string;
  data: PBLSubmission;
}

export interface PBLSubmissionListResponse {
  message: string;
  data: PBLSubmission[];
}

// Error Response
export interface APIErrorResponse {
  message: string;
  error?: string;
}
