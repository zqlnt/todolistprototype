// API service layer for FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://todolistprototype.onrender.com/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  // Authentication endpoints
  async signIn(email: string, password: string) {
    return this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(email: string, password: string) {
    return this.request<{
      access_token: string;
      token_type: string;
      user: any;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request('/api/auth/signout', {
      method: 'POST',
    });
  }

  async getUser(token: string) {
    return this.request(`/api/auth/user?token=${token}`);
  }

  // Task endpoints
  async getTasks() {
    try {
      return await this.request<{
        success: boolean;
        data: any[];
        message?: string;
      }>('/api/tasks/');
    } catch (error) {
      // Fallback to always-working endpoint
      return this.request<{
        success: boolean;
        data: any[];
        message?: string;
      }>('/api/tasks/fallback/list');
    }
  }

  async createTask(task: {
    title: string;
    dueAt?: string | null;
    category?: string | null;
    isStarred?: boolean;
    parentId?: string | null;
  }) {
    try {
      return await this.request<{
        success: boolean;
        data: any;
        message?: string;
      }>('/api/tasks/', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    } catch (error) {
      // Fallback to always-working endpoint
      return this.request<{
        success: boolean;
        data: any;
        message?: string;
      }>('/api/tasks/fallback/create', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    }
  }

  async updateTask(taskId: string, updates: {
    title?: string;
    status?: 'pending' | 'done';
    dueAt?: string;
    isStarred?: boolean;
    category?: string;
  }) {
    try {
      return await this.request<{
        success: boolean;
        data: any;
        message?: string;
      }>(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // Fallback to always-working endpoint
      return this.request<{
        success: boolean;
        data: any;
        message?: string;
      }>(`/api/tasks/fallback/update/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
  }

  async deleteTask(taskId: string) {
    try {
      return await this.request(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback to always-working endpoint
      return this.request(`/api/tasks/fallback/delete/${taskId}`, {
        method: 'DELETE',
      });
    }
  }

  async toggleTaskStatus(taskId: string) {
    return this.request(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
    });
  }

  async toggleTaskStar(taskId: string) {
    return this.request(`/api/tasks/${taskId}/star`, {
      method: 'PUT',
    });
  }

  // Email endpoints
  async getEmails() {
    return this.request<any[]>('/api/emails/');
  }

  async syncEmails() {
    return this.request<{
      success: boolean;
      emails: any[];
      suggestions: any[];
      message?: string;
    }>('/api/emails/sync', {
      method: 'POST',
    });
  }

  async getEmailSuggestions() {
    return this.request<any[]>('/api/emails/suggestions');
  }
}

export const apiService = new ApiService();
export { ApiError };