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



export interface Answer {
  id: number;
  text: string;
  is_correct?: boolean;
}

export interface Passage {
  id: number;
  title?: string;
  content?: string;
  image?: string | null;
}

export interface Question {
  id: number;
  text: string;
  order: number;
  passage: Passage | null;
  answers: Answer[];
}


export interface Exam {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  is_active: boolean;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  requires_password: boolean;
}


export interface ExamTake {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  questions: Question[];
}

export interface StartExamResponse {
  session_id: number;
  expires_at: string;
  exam: ExamTake;
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

export interface SubmitAnswerItem {
  question_id: number;
  selected_answer_id: number | null;
}

export interface AnswerSheet {
  [questionId: number]: number | null;
}

export interface SubmitResponse {
  id: number;
  student: string;
  exam_title: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  finished_at: string;
}

const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return '/api';
  }
  return 'https://ae-exam.onrender.com/api';
};

const API = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,

});

const ACCESS_TOKEN_KEY = 'ae_auth_token';

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

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
      const friendlyMessage =
        extractDjoserErrorMessage(error.response.data) ||
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      return Promise.reject({
        message: friendlyMessage,
        status: error.response.status,
      });
    }

    console.error('Request setup error:', error.message);
    return Promise.reject({ message: error.message || 'Request failed' });
  }
);


export const getExams = async (): Promise<Exam[]> => {
  try {
    const response = await API.get<Exam[]>('/exams/');
    return response.data;
  } catch (error) {
    console.error('getExams failed:', error);
    throw error;
  }
};


export const getExam = async (id: number): Promise<Exam> => {
  try {
    const exams = await getExams();
    const exam = exams.find((e) => e.id === id);
    if (!exam) {
      throw { message: 'Exam not found.', status: 404 };
    }
    return exam;
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


export const startExam = async (id: number, password?: string): Promise<StartExamResponse> => {
  try {
    const payload = password ? { password } : {};
    const response = await API.post<StartExamResponse>(`/exams/${id}/start/`, payload);
    return response.data;
  } catch (error) {
    console.error(`startExam(${id}) failed:`, error);
    throw error;
  }
};


export const submitExam = async (id: number, answers: AnswerSheet): Promise<SubmitResponse> => {
  const answersArray: SubmitAnswerItem[] = Object.entries(answers).map(
    ([questionId, selectedAnswerId]) => ({
      question_id: Number(questionId),
      selected_answer_id: selectedAnswerId ?? null,
    })
  );

  const response = await API.post<SubmitResponse>(`/exams/${id}/submit/`, {
    answers: answersArray,
  });
  return response.data;
};

export interface ExamHistoryItem {
  id: number;
  exam: number | { id: number; title: string };
  exam_title?: string;
  started_at: string;
  submitted: boolean;
  percentage?: number;
  passed?: boolean;
  result?: {
    percentage?: number;
    passed?: boolean;
  };
}

export const getExamHistory = async (): Promise<ExamHistoryItem[]> => {
  try {
    const response = await API.get<ExamHistoryItem[]>('/exams/history/');
    return response.data;
  } catch (error) {
    console.error('getExamHistory failed:', error);
    throw error;
  }
};

export const getExamResult = async (id: number): Promise<SubmitResponse> => {
  const response = await API.get<SubmitResponse>(`/exams/${id}/result/`);
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