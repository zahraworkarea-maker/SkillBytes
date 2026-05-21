import apiClient from './api-client';
import { getCurrentUserId } from './utils';

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
}

// ============= Authentication Services =============

export const authService = {
  /**
   * Initialize CSRF token dari Laravel (hanya untuk session-based auth)
   * Untuk Sanctum, bisa dipanggil sebelum login
   */
  async initializeCsrf() {
    try {
      await apiClient.get('/csrf-token');
    } catch (error) {
      console.error('Failed to initialize CSRF:', error);
    }
  },

  /**
   * Login user dengan email dan password
   */
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post('/auth/user/login', {
        email,
        password,
      });
      
      // Simpan token jika ada di response
      if (response.data.token) {
        setCookie('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register user baru
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      const response = await apiClient.post('/auth/user/register', data);
      
      if (response.data.token) {
        setCookie('auth_token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout() {
    // Backend tidak menyediakan endpoint logout, jadi cukup clear auth cookie di client.
    clearCookie('auth_token');
    clearCookie('auth_user');
  },

  /**
   * Get current user data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user data by ID
   */
  async getUserById(id: number | string) {
    try {
      const response = await apiClient.get(`/auth/user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= User Services =============

export const userService = {
  /**
   * Get semua users
   */
  async getAllUsers() {
    try {
      const response = await apiClient.get('/auth/user/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user berdasarkan ID
   */
  async getUserById(id: number | string) {
    try {
      const response = await apiClient.get(`/auth/user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user data (profile photo, etc)
   */
  async updateUser(id: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.post(`/auth/user/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user
   */
  async deleteUser(id: number | string) {
    try {
      const response = await apiClient.delete(`/auth/user/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= Tambahkan lebih banyak services sesuai kebutuhan =============
// Contoh: courseService, assessmentService, pblService, dll

export const courseService = {
  /**
   * Get semua courses/materi
   */
  async getAllCourses() {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get course berdasarkan ID
   */
  async getCourseById(id: number | string) {
    try {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export const assessmentService = {
  /**
   * Get semua assessments dengan pagination
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 15)
   * @param search - Search term (optional)
   * Response structure:
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "id": 3,
   *       "slug": "l1-sample-5q",
   *       "title": "Sample: Dasar Class & Object (5 soal)",
   *       "description": "Assessment singkat 5 soal untuk konsep dasar class dan object",
   *       "time_limit": 15,
   *       "total_questions": 5,
   *       "created_at": "2026-05-13T16:01:33.000000Z",
   *       "updated_at": "2026-05-13T16:01:33.000000Z"
   *     }
   *   ],
   *   "pagination": {
   *     "total": 3,
   *     "count": 3,
   *     "per_page": 15,
   *     "current_page": 1,
   *     "last_page": 1
   *   }
   * }
   */
  async getAllAssessments(page: number = 1, perPage: number = 15, search?: string) {
    try {
      const params: any = {
        page,
        per_page: perPage,
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await apiClient.get('/assessments', {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get assessment berdasarkan ID
   */
  async getAssessmentById(id: number | string) {
    try {
      const response = await apiClient.get(`/assessments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get assessment detail berdasarkan slug
   * Response structure:
   * {
   *   "success": true,
   *   "data": {
   *     "id": "2",
   *     "title": "General Knowledge Test",
   *     "description": "Test your general knowledge about various topics",
   *     "total_questions": 2,
   *     "time_limit": 45,
   *     "questions": [
   *       {
   *         "id": "4",
   *         "question": "What is the capital of Indonesia?",
   *         "options": [
   *           {
   *             "id": "13",
   *             "label": "a",
   *             "text": "Bandung"
   *           },
   *           ...
   *         ]
   *       }
   *     ]
   *   }
   * }
   */
  async getAssessmentBySlug(slug: string) {
    try {
      const response = await apiClient.get(`/assessments/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new assessment
   * @param data - Assessment data (title, slug, description, time_limit)
   */
  async createAssessment(data: Record<string, any>) {
    try {
      const response = await apiClient.post('/assessments', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an assessment
   * @param id - Assessment ID
   * @param data - Updated assessment data
   */
  async updateAssessment(id: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.put(`/assessments/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an assessment
   * @param id - Assessment ID
   */
  async deleteAssessment(id: number | string) {
    try {
      const response = await apiClient.delete(`/assessments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit assessment/quiz
   */
  async submitAssessment(id: number | string, answers: Record<string, any>) {
    try {
      const response = await apiClient.post(`/assessments/${id}/submit`, answers);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create multiple questions with multiple options in bulk for an assessment
   * @param assessmentId - Assessment ID
   * @param questions - Array of questions with their options
   * Handles creating questions and options across separate endpoints
   * Response structure:
   * {
   *   "success": true,
   *   "message": "Questions created successfully",
   *   "data": [
   *     {
   *       "id": 1,
   *       "text": "What is...",
   *       "assessment_id": 1,
   *       "options": [
   *         {
   *           "id": 1,
   *           "label": "A",
   *           "text": "Answer A",
   *           "is_correct": true,
   *           "question_id": 1
   *         },
   *         {
   *           "id": 2,
   *           "label": "B",
   *           "text": "Answer B",
   *           "is_correct": false,
   *           "question_id": 1
   *         }
   *       ]
   *     }
   *   ]
   * }
   */
  /**
   * Bulk create questions for assessment
   * @param assessmentId - Assessment ID
   * @param questions - Array of questions with options and optional images
   */
  async bulkCreateQuestions(
    assessmentId: number | string,
    questions: Array<{
      question: string;
      options: Array<{
        label: string;
        text: string;
        is_correct: boolean;
      }>;
      image?: File | null;
      imagePreview?: string;
    }>
  ) {
    try {
      // If any question includes an image, send multipart/form-data with indexed fields
      const hasImage = questions.some((q) => q.image instanceof File);

      if (hasImage) {
        const fd = new FormData();

        questions.forEach((q, idx) => {
          fd.append(`questions[${idx}][text]`, q.question);
          if (q.image) {
            fd.append(`questions[${idx}][image]`, q.image as File);
          }
          // Append options as JSON string per index if backend expects options with question
          if (q.options && q.options.length) {
            fd.append(`questions[${idx}][options]`, JSON.stringify(q.options));
          }
        });

        const response = await apiClient.post(
          `/assessments/${assessmentId}/questions`,
          fd,
          {
            headers: {
              // Let the browser set Content-Type (multipart/form-data + boundary)
            },
          }
        );

        // Backend returns created questions in response.data.data.questions or data
        const responseData = response.data.data || response.data;
        const createdList = Array.isArray(responseData) ? responseData : responseData.questions || [];

        // If options were not created by backend, attempt to create them per question
        const results: any[] = [];

        for (let i = 0; i < createdList.length; i++) {
          const qData = createdList[i];
          const opts = questions[i].options || [];

          if (opts.length) {
            try {
              const optsResp = await apiClient.post(`/questions/${qData.id}/options`, { options: opts }, { headers: { 'Content-Type': 'application/json' } });
              qData.options = optsResp.data.data || optsResp.data || [];
            } catch (optErr) {
              console.warn(`Failed to create options for question ${qData.id}:`, optErr);
              qData.options = [];
            }
          }

          results.push(qData);
        }

        return {
          success: true,
          message: 'Questions created successfully',
          data: results,
        };
      }

      // Fallback: no images, send JSON as before
      const formattedQuestions = questions.map((q) => ({ text: q.question }));

      const questionsResponse = await apiClient.post(
        `/assessments/${assessmentId}/questions`,
        { questions: formattedQuestions },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const responseData = questionsResponse.data.data || questionsResponse.data;
      const createdQuestionsList = Array.isArray(responseData) ? responseData : responseData.questions || [];
      const createdQuestions: any[] = [];

      for (let i = 0; i < createdQuestionsList.length; i++) {
        const questionData = createdQuestionsList[i];
        const questionId = questionData.id;
        const questionOptions = questions[i].options;

        const optionsResponse = await apiClient.post(
          `/questions/${questionId}/options`,
          { options: questionOptions },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const optionsData = optionsResponse.data.data || optionsResponse.data;
        const createdOptions = Array.isArray(optionsData) ? optionsData : optionsData.options || [];

        createdQuestions.push({
          ...questionData,
          options: createdOptions,
        });
      }

      return {
        success: true,
        message: 'Questions created successfully',
        data: createdQuestions,
      };
    } catch (error) {
      throw error;
    }
  },
};

// ============= Assessment Level Services =============

export const assessmentLevelService = {
  /**
   * Get semua assessment levels dengan pagination
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 100)
   * @param search - Search term (optional)
   */
  async getAllAssessmentLevels(page: number = 1, perPage: number = 100, search?: string) {
    try {
      const params: any = {
        page,
        per_page: perPage,
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await apiClient.get('/assessment-levels', {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get assessment level berdasarkan ID
   */
  async getAssessmentLevelById(id: number | string) {
    try {
      const response = await apiClient.get(`/assessment-levels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new assessment level
   */
  async createAssessmentLevel(data: Record<string, any>) {
    try {
      const response = await apiClient.post('/assessment-levels', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an assessment level
   */
  async updateAssessmentLevel(id: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.put(`/assessment-levels/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an assessment level
   */
  async deleteAssessmentLevel(id: number | string) {
    try {
      const response = await apiClient.delete(`/assessment-levels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= Materi/Levels Services =============

export const materiService = {
  /**
   * Get semua levels dengan lessons
   * Response structure:
   * {
   *   success: true,
   *   message: "...",
   *   data: [
   *     {
   *       id: number,
   *       level_number: 1,
   *       lessons: [
   *         {
   *           id: number,
   *           slug: string,
   *           level_id: number,
   *           title: string,
   *           description: string,
   *           duration: string,
   *           pdf_url: string,
   *           completed: boolean,
   *           created_at: string,
   *           updated_at: string
   *         }
   *       ],
   *       created_at: string,
   *       updated_at: string
   *     }
   *   ]
   * }
   */
  async getAllLevels() {
    try {
      const response = await apiClient.get('/levels/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's material progress including levels and lessons
   * Response structure:
   * {
   *   userId: number,
   *   totalLessons: number,
   *   completedLessons: number,
   *   progressPercentage: number,
   *   levels: [
   *     {
   *       id: number,
   *       level_number: number,
   *       lessons: [
   *         {
   *           id: number,
   *           slug: string,
   *           level_id: number,
   *           title: string,
   *           description: string,
   *           duration: string,
   *           pdf_url: string,
   *           completed: boolean,
   *           created_at: string,
   *           updated_at: string
   *         }
   *       ],
   *       created_at: string,
   *       updated_at: string
   *     }
   *   ]
   * }
   */
  async getMyProgress() {
    try {
      const response = await apiClient.get('/my-progress');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get level berdasarkan ID
   */
  async getLevelById(levelId: number | string) {
    try {
      const response = await apiClient.get(`/levels/${levelId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get lessons dalam level tertentu
   */
  async getLessonsByLevel(levelId: number | string) {
    try {
      const response = await apiClient.get(`/levels/${levelId}/lessons`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark lesson sebagai completed
   * @param lessonId - Lesson ID (bisa numeric ID atau slug)
   */
  async completeLesson(lessonId: string) {
    try {
      console.log('[MATERI SERVICE] Completing lesson:', lessonId);
      console.log('[MATERI SERVICE] API Base URL:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post(`/lessons/${lessonId}/complete`);
      
      console.log('[MATERI SERVICE] Lesson completed successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[MATERI SERVICE] Error completing lesson:', {
        lessonId,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
  },

  /**
   * Get lesson detail berdasarkan lesson ID
   * Response structure:
   * {
   *   data: [
   *     {
   *       id: string,
   *       title: string,
   *       description: string,
   *       duration: string (dalam menit),
   *       pdf_url: string,
   *       completed: boolean
   *     }
   *   ]
   * }
   */
  async getLessonById(lessonId: string) {
    try {
      const response = await apiClient.get(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= PBL Services =============

export const pblService = {
  /**
   * Get semua PBL cases dengan pagination
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 15)
   * Response structure:
   * {
   *   current_page: number,
   *   data: [
   *     {
   *       id: number,
   *       slug: string,
   *       case_number: number,
   *       title: string,
   *       pbl_level_id: number,
   *       description: string,
   *       image_url: string | null,
   *       time_limit: number,
   *       start_date: string,
   *       deadline: string,
   *       pbl_level: {
   *         id: number,
   *         name: string,
   *         created_at: string,
   *         updated_at: string
   *       },
   *       status: 'not-started' | 'in-progress' | 'completed'
   *     }
   *   ],
   *   first_page_url: string,
   *   from: number,
   *   last_page: number,
   *   last_page_url: string,
   *   links: Array<{url: string | null, label: string, active: boolean}>,
   *   next_page_url: string | null,
   *   path: string,
   *   per_page: number,
   *   prev_page_url: string | null,
   *   to: number,
   *   total: number
   * }
   */
  async getAllCases(page: number = 1, perPage: number = 15) {
    try {
      const response = await apiClient.get('/pbl-cases', {
        params: {
          page,
          per_page: perPage,
        },
      });
      console.log('[PBL SERVICE] PBL cases fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PBL SERVICE] Error fetching PBL cases:', error);
      throw error;
    }
  },

  /**
   * Get PBL case berdasarkan ID
   * Response includes case data with sections array
   * @param id - Case ID
   * @returns Case with sections included
   * Response structure:
   * {
   *   "data": {
   *     "id": 1,
   *     "slug": "system-login-...",
   *     "case_number": 1,
   *     "title": "...",
   *     "status": "completed",
   *     "sections": [
   *       {
   *         "id": 1,
   *         "title": "...",
   *         "order": 1,
   *         "items": [...]
   *       }
   *     ]
   *   }
   * }
   */
  async getCaseById(id: number | string) {
    try {
      const response = await apiClient.get(`/pbl-cases/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get PBL sections untuk case tertentu
   */
  async getSectionsByCase(caseId: number | string) {
    try {
      const response = await apiClient.get(`/pbl-cases/${caseId}/sections`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit PBL solution
   */
  async submitSolution(caseId: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.post(`/pbl-cases/${caseId}/submit`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit PBL submission with file
   * @param caseId - Case ID
   * @param formData - FormData with submission_file and answer
   */
  async submitPBL(caseId: number | string, formData: FormData) {
    try {
      const response = await apiClient.post(`/pbl-submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all submissions for a case
   */
  async getSubmissions(params?: { case_id?: number; page?: number; per_page?: number }) {
    try {
      const response = await apiClient.get(`/pbl-submissions`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get submission by ID
   */
  async getSubmissionById(id: number | string) {
    try {
      const response = await apiClient.get(`/pbl-submissions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= Question Services =============

export const questionService = {
  /**
   * Create a new question for assessment
   * @param assessmentId - Assessment ID
   * @param data - Question data (question, options array) or FormData with image
   * Response structure:
   * {
   *   "success": true,
   *   "data": {
   *     "id": 1,
   *     "question": "What is the capital of France?",
   *     "assessment_id": 1,
   *     "image_path": "path/to/image.jpg",
   *     "created_at": "2026-05-18T...",
   *     "updated_at": "2026-05-18T..."
   *   }
   * }
   */
  async createQuestion(assessmentId: number | string, data: Record<string, any> | FormData) {
    try {
      const isFormData = data instanceof FormData;
      const response = await apiClient.post(`/assessments/${assessmentId}/questions`, data, {
        headers: isFormData ? {
          // Let browser set Content-Type for FormData
        } : {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing question
   * @param id - Question ID
   * @param data - Updated question data or FormData with image
   */
  async updateQuestion(id: number | string, data: Record<string, any> | FormData) {
    try {
      const isFormData = data instanceof FormData;
      const response = await apiClient.put(`/questions/${id}`, data, {
        headers: isFormData ? {
          // Let browser set Content-Type for FormData
        } : {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a question
   * @param id - Question ID
   */
  async deleteQuestion(id: number | string) {
    try {
      const response = await apiClient.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get question by ID
   * @param id - Question ID
   */
  async getQuestionById(id: number | string) {
    try {
      const response = await apiClient.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= Option Services =============

export const optionService = {
  /**
   * Create a new option for question
   * @param questionId - Question ID
   * @param data - Option data (label, text, is_correct)
   * Response structure:
   * {
   *   "success": true,
   *   "data": {
   *     "id": 1,
   *     "question_id": 1,
   *     "label": "A",
   *     "text": "Paris",
   *     "is_correct": true,
   *     "created_at": "2026-05-18T...",
   *     "updated_at": "2026-05-18T..."
   *   }
   * }
   */
  async createOption(questionId: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.post(`/questions/${questionId}/options`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an existing option
   * @param id - Option ID
   * @param data - Updated option data
   */
  async updateOption(id: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.put(`/options/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an option
   * @param id - Option ID
   */
  async deleteOption(id: number | string) {
    try {
      const response = await apiClient.delete(`/options/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get option by ID
   * @param id - Option ID
   */
  async getOptionById(id: number | string) {
    try {
      const response = await apiClient.get(`/options/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all options for a question
   * @param questionId - Question ID
   */
  async getOptionsByQuestion(questionId: number | string) {
    try {
      const response = await apiClient.get(`/questions/${questionId}/options`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= Assessment Attempt Services =============

export const assessmentAttemptService = {
  /**
   * Start an assessment attempt
   * @param assessmentId - Assessment ID
   * Returns: { attempt_id, assessment: {...questions} }
   */
  async startAssessment(assessmentId: number | string) {
    try {
      console.log(`📤 [API] POST /assessments/${assessmentId}/start - Sending request...`);
      const response = await apiClient.post(`/assessments/${assessmentId}/start`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`✅ [API] POST /assessments/${assessmentId}/start - Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [API] POST /assessments/${assessmentId}/start - Error:`, error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Submit an answer for a question (deprecated - use submitAnswersBatch instead)
   * @param attemptId - Attempt ID
   * @param questionId - Question ID
   * @param selectedOptionId - Selected option ID
   */
  async submitAnswer(attemptId: number | string, questionId: number | string, selectedOptionId: number | string) {
    try {
      const response = await apiClient.post(
        `/assessments/${attemptId}/answers`,
        {
          question_id: questionId,
          selected_option_id: selectedOptionId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit multiple answers in batch
   * @param attemptId - Attempt ID
   * @param answers - Object mapping questionId to selectedOptionId
   * Example: { "1": "uuid-1", "2": "uuid-2", "3": "uuid-3" }
   */
  async submitAnswersBatch(attemptId: number | string, answers: Record<number | string, number | string>) {
    try {
      // Convert answers object to array format expected by backend
      const answersArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        question_id: parseInt(String(questionId), 10), // Convert to number
        selected_option_id: selectedOptionId,
      }));

      console.log(`📤 [API] Batch submitting ${answersArray.length} answers for attempt ${attemptId}`);
      console.log(`📤 [API] Payload:`, { answers: answersArray });
      
      const response = await apiClient.post(
        `/assessments/${attemptId}/answers`,
        {
          answers: answersArray,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log(`✅ [API] Batch answers submitted successfully`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ [API] Batch submit failed:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Finish an assessment attempt (submit and get score)
   * @param attemptId - Attempt ID
   * Returns: { score, correct_answers, total_questions, status, completed_at }
   */
  async finishAssessment(attemptId: number | string) {
    try {
      const response = await apiClient.post(
        `/assessments/${attemptId}/finish`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active attempt for an assessment (if exists)
   * @param assessmentId - Assessment ID
   */
  async getActiveAttempt(assessmentId: number | string) {
    try {
      const response = await apiClient.get(`/assessments/${assessmentId}/attempt`);
      return response.data;
    } catch (error: any) {
      // If 404 (no active attempt), return success: false instead of throwing error
      if (error.response?.status === 404) {
        console.log(`⚠️ [API] GET /assessments/${assessmentId}/attempt - 404 Not Found (no active attempt)`);
        return {
          success: false,
          data: null,
          message: 'No active attempt found'
        };
      }
      
      // For other errors, throw them
      console.error(`❌ [API] GET /assessments/${assessmentId}/attempt - Error:`, error.response?.status, error.response?.data || error.message);
      throw error;
    }
  },
};

// ============= Assessment Result Services =============

export const assessmentResultService = {
  /**
   * Get all assessment results/history for current user
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 15)
   * Automatically filters by current user ID from cookie
   */
  async getAllResults(page: number = 1, perPage: number = 15) {
    try {
      console.log(`🔥 [API SERVICE] getAllResults called with page: ${page}, perPage: ${perPage}`);
      console.log(`🔥 [API SERVICE] About to call apiClient.get('/results')`);
      
      const response = await apiClient.get('/results', {
        params: {
          page,
          per_page: perPage,
        },
      });
      
      console.log(`🔥 [API SERVICE] Response received from /results:`, response.data);
      
      // Filter results by current user ID
      const currentUserId = getCurrentUserId();
      if (response.data.success && response.data.data && Array.isArray(response.data.data) && currentUserId) {
        const filteredData = response.data.data.filter(
          (result: any) => String(result.user_id) === currentUserId
        );
        
        console.log(`🔥 [API SERVICE] Filtered ${filteredData.length} results for user ${currentUserId} from total ${response.data.data.length}`);
        
        return {
          ...response.data,
          data: filteredData,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`🔥 [API SERVICE] Error in getAllResults:`, error);
      throw error;
    }
  },

  /**
   * Get detailed result for a specific attempt
   * @param attemptId - Attempt ID
   * Returns: { score, correct_answers, total_questions, answers: [{question, selected, correct, is_correct}] }
   */
  async getResultDetail(attemptId: number | string) {
    try {
      const response = await apiClient.get(`/results/${attemptId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get active IN_PROGRESS attempt for a specific assessment by slug
   * @param assessmentSlug - Assessment slug
   * Automatically filters by current user ID from cookie
   * Returns: the active attempt if found, null otherwise
   */
  async getActiveAttemptBySlug(assessmentSlug: string) {
    try {
      console.log(`📋 [API] Fetching all results to find IN_PROGRESS attempt for slug: ${assessmentSlug}`);
      const response = await apiClient.get('/results', {
        params: {
          page: 1,
          per_page: 15,
        },
      });
      
      console.log(`✅ [API] Results fetched, total:`, response.data.pagination?.total);
      
      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
        const currentUserId = getCurrentUserId();
        console.log(`🔍 [API] Filtering results for user_id: ${currentUserId}`);
        
        // Find the first IN_PROGRESS attempt for this assessment AND current user
        const activeAttempt = response.data.data.find(
          (result: any) => 
            result.assessment?.slug === assessmentSlug && 
            result.status === 'IN_PROGRESS' &&
            String(result.user_id) === currentUserId
        );
        
        if (activeAttempt) {
          console.log(`✅ Found IN_PROGRESS attempt for slug "${assessmentSlug}" and user ${currentUserId}:`, activeAttempt.id);
          return {
            success: true,
            data: activeAttempt,
          };
        } else {
          console.log(`⚠️ No IN_PROGRESS attempt found for slug "${assessmentSlug}" and user ${currentUserId}`);
          return {
            success: false,
            data: null,
            message: 'No active IN_PROGRESS attempt found',
          };
        }
      } else {
        console.log(`⚠️ Invalid response structure from /results`);
        return {
          success: false,
          data: null,
          message: 'Invalid response structure',
        };
      }
    } catch (error: any) {
      console.error(`❌ [API] Error fetching results:`, error.response?.status, error.response?.data || error.message);
      // Return gracefully instead of throwing
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Error fetching results',
      };
    }
  },
};

// ============= Generic API Handler =============

/**
 * Generic API handler function for making requests
 * Used by services that need flexibility with request configuration
 * @param url - The endpoint URL
 * @param config - Request configuration (method, params, data, headers, etc)
 * @returns Promise with response data
 */
export const apiHandler = async (url: string, config: any = {}) => {
  try {
    const method = (config.method || 'GET').toUpperCase();
    
    switch (method) {
      case 'GET':
        return await apiClient.get(url, { params: config.params });
      case 'POST':
        return await apiClient.post(url, config.data, { 
          headers: config.headers 
        });
      case 'PUT':
        return await apiClient.put(url, config.data, { 
          headers: config.headers 
        });
      case 'DELETE':
        return await apiClient.delete(url);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  } catch (error) {
    throw error;
  }
};
