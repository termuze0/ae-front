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

// ✅ IMPORTANT: Use relative path /api for development
// This will go through the Vite proxy and avoid CORS
const API = axios.create({
  baseURL: '/api',  // This works with the proxy in vite.config.ts
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Log the base URL for debugging
console.log('API Base URL:', API.defaults.baseURL);

// API Functions
export const getExams = async (): Promise<Exam[]> => {
  try {
    console.log('Fetching exams from:', API.defaults.baseURL + '/exam');
    const response = await API.get<Exam[]>("/exam");
    console.log('Exams received:', response.data);
    return response.data;
  } catch (error) {
    console.error('getExams failed:', error);
    throw error;
  }
};

export const getExam = async (id: number): Promise<Exam> => {
  const response = await API.get<Exam>(`/exam/${id}`);
  return response.data;
};

export const submitExam = async (id: number, answers: AnswerSheet): Promise<SubmitResponse> => {
  const response = await API.post<SubmitResponse>(`/exam/${id}/submit`, { answers });
  return response.data;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await getExams();
    console.log("✅ API connection successful!");
    return true;
  } catch (error) {
    console.error("❌ API connection failed:", error);
    return false;
  }
};