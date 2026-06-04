import axios from 'axios';

// Type definitions
export interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  questions?: Question[];
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
    return '/api'; // Use Vite proxy in development
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

// Only add credentials if absolutely needed (like for session-based auth)
// For token-based auth (JWT), you don't need credentials
API.interceptors.request.use(
  (config) => {
    // Add auth token if needed (this doesn't trigger CORS credentials preflight)
    const token = localStorage.getItem('token');
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
      return Promise.reject({ 
        message: error.response.data?.message || `Server error: ${error.response.status}`,
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
    const response = await API.get<Exam[]>("/exam");
    return response.data;
  } catch (error) {
    console.error('getExams failed:', error);
    throw error;
  }
};

export const getExam = async (id: number): Promise<Exam> => {
  try {
    const response = await API.get<Exam>(`/exam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`getExam(${id}) failed:`, error);
    throw error;
  }
};

export const submitExam = async (id: number, answers: AnswerSheet): Promise<SubmitResponse> => {
  const response = await API.post<SubmitResponse>(`/exam/${id}/submit`, { answers });
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

export default API;