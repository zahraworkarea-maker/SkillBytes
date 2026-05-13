import apiClient from './api-client';

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
   * Get semua assessments
   */
  async getAllAssessments() {
    try {
      const response = await apiClient.get('/assessments');
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
