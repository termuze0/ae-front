import axios from 'axios';

const extractDjoserErrorMessage = (data: any): string => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.filter(Boolean).join(' ');
  if (typeof data === 'object') {
    if (data.detail) return String(data.detail);
    if (data.message) return String(data.message);

    const messages: string[] = [];
    for (const key of Object.keys(data)) {
      const value = data[key];

      if (Array.isArray(value)) {
        const text = value.filter(Boolean).join(' ');
        if (text) {
          messages.push(key === 'non_field_errors' ? text : `${key.replace(/_/g, ' ')}: ${text}`);
        }
      } else if (typeof value === 'string') {
        messages.push(key === 'non_field_errors' ? value : `${key.replace(/_/g, ' ')}: ${value}`);
      } else if (value && typeof value === 'object') {
        const nested = extractDjoserErrorMessage(value);
        if (nested) {
          messages.push(key === 'non_field_errors' ? nested : `${key.replace(/_/g, ' ')}: ${nested}`);
        }
      }
    }

    return messages.join(' ');
  }

  return '';
};

// Type definitions
export interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface Passage {
  id: number;
  title?: string;
  content?: string;
  // image field returned by backend (Cloudinary) is typically a URL string or null
  image?: string | null;
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
  // backend may return a passage id, a nested passage object, or null
  passage?: number | Passage | null;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  duration?: number;
  total_questions?: number;
  questions?: Question[];
  // Optional passage support: backend may provide a passage object, url, or plain text. Can be null.
  passage?: number | Passage | string | null;
  passage_id?: number | null;
}

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
}

export interface AnswerSheet {
  [questionId: number]: number;
}

export interface SubmitResponse {
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  percentage: number;
}

// Determine API URL based on environment
const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return '/api'; 
  }
  return 'https://ae-exam.onrender.com/api';
};

// Create axios instance WITHOUT default credentials
const API = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  // DO NOT set withCredentials: true unless backend explicitly allows your origin
  // withCredentials: false is the default and works with wildcard CORS
});

const ACCESS_TOKEN_KEY = 'ae_auth_token';

// Only add credentials if absolutely needed (like for session-based auth)
// For token-based auth (JWT), you don't need credentials
API.interceptors.request.use(
  (config) => {
    // Add auth token if needed (this doesn't trigger CORS credentials preflight)
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only add credentials if your backend requires it and has proper CORS config
    // config.withCredentials = false; // Explicitly false by default
    
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - cannot reach the server');
      return Promise.reject({ message: 'Cannot connect to server. Please check your internet connection.' });
    }
    
    if (error.response) {
      console.error(`Server error ${error.response.status}:`, error.response.data);
      const friendlyMessage = extractDjoserErrorMessage(error.response.data) || error.response.data?.message || `Server error: ${error.response.status}`;
      return Promise.reject({ 
        message: friendlyMessage,
        status: error.response.status 
      });
    }
    
    console.error('Request setup error:', error.message);
    return Promise.reject({ message: error.message || 'Request failed' });
  }
);

// API Functions
export const getExams = async (): Promise<Exam[]> => {
  try {
    const response = await API.get<Exam[]>("/exams/");
    return response.data;
  } catch (error) {
    console.error('getExams failed:', error);
    throw error;
  }
};

export const getExam = async (id: number): Promise<Exam> => {
  try {
    const response = await API.get<Exam>(`/exams/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`getExam(${id}) failed:`, error);
    throw error;
  }
};

export const getPassage = async (id: number): Promise<Passage> => {
  try {
    const response = await API.get<Passage>(`/passages/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`getPassage(${id}) failed:`, error);
    throw error;
  }
};

export const submitExam = async (id: number, answers: AnswerSheet): Promise<SubmitResponse> => {
  // If your backend exposes a dedicated submit endpoint, update this path accordingly.
  const response = await API.post<SubmitResponse>(`/exams/${id}/submit/`, { answers });
  return response.data;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await getExams();
    console.log('✅ API connection successful!');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface DjoserUserResponse {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export const loginUser = async (username: string, password: string): Promise<AuthTokens> => {
  const payload = { username, password };
  const response = await API.post<AuthTokens>('/auth/jwt/create/', payload);
  return response.data;
};

export const registerUser = async (name: string, email: string, password: string): Promise<DjoserUserResponse> => {
  const payload = {
    email,
    password,
    re_password: password,
    username: name || email,
  };
  const response = await API.post<DjoserUserResponse>('/auth/users/', payload);
  return response.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const response = await API.get<AuthUser>('/auth/users/me/');
  return response.data;
};

export const refreshAccessToken = async (refresh: string): Promise<string> => {
  const response = await API.post<{ access: string }>('/auth/jwt/refresh/', { refresh });
  return response.data.access;
};

export default API;