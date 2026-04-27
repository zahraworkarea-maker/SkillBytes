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
      await apiClient.get('/api/csrf-token');
    } catch (error) {
      console.error('Failed to initialize CSRF:', error);
    }
  },

  /**
   * Login user dengan email dan password
   */
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post('auth/user/login', {
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
      const response = await apiClient.post('/api/register', data);
      
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
      const response = await apiClient.get('/api/user');
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
      const response = await apiClient.get(`auth/user/${id}`);
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
      const response = await apiClient.get('/api/users');
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
      const response = await apiClient.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user data
   */
  async updateUser(id: number | string, data: Record<string, any>) {
    try {
      const response = await apiClient.put(`/api/users/${id}`, data);
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
      const response = await apiClient.delete(`/api/users/${id}`);
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
      const response = await apiClient.get('/api/courses');
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
      const response = await apiClient.get(`/api/courses/${id}`);
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
      const response = await apiClient.get('/api/assessments');
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
      const response = await apiClient.get(`/api/assessments/${id}`);
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
      const response = await apiClient.post(`/api/assessments/${id}/submit`, answers);
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
