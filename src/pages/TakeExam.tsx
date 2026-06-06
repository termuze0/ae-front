import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getExam } from '../services/api';
import type { Exam, AnswerSheet, SubmitResponse } from '../services/api';

// Gemini API configuration — load API key from Vite env to avoid committing secrets
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

interface Explanation {
  [questionId: number]: {
    isCorrect: boolean;
    explanation: string;
    correctAnswer: string;
    userAnswer: string;
    detailedExplanation: string;
  };
}

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<AnswerSheet>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchExam();
    }
  }, [id]);

  const fetchExam = async () => {
    try {
      setError(null);
      console.log(`Fetching exam ${id} for taking...`);
      const examData = await getExam(parseInt(id!));
      
      if (!examData) {
        throw new Error('No exam data received');
      }
      
      if (!examData.duration_minutes && examData.duration_minutes !== 0) {
        throw new Error('Exam data is missing duration_minutes field');
      }
      
      setExam(examData);
      setTimeLeft(examData.duration_minutes * 60);
      
      const initialAnswers: AnswerSheet = {};
      examData.questions?.forEach((question) => {
        initialAnswers[question.id] = 0;
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError(error instanceof Error ? error.message : 'Failed to load exam. Please try again.');
    }
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answerId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (exam?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (exam?.questions?.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  const getDetailedExplanationFromGemini = async (question: any, userAnswerId: number, isCorrect: boolean) => {
    try {
      setLoadingExplanation(question.id);
      
      const selectedAnswer = question.answers.find((a: any) => a.id === userAnswerId);
      const correctAnswer = question.answers.find((a: any) => a.is_correct);
      
      const prompt = `You are an expert math tutor. Provide a VERY DETAILED educational explanation for the following question.

Question: "${question.text}"
Student's Answer: ${selectedAnswer?.text || 'No answer selected'}
Correct Answer: ${correctAnswer?.text}
The student ${isCorrect ? 'answered correctly' : 'answered incorrectly'}.

Please provide a comprehensive explanation with:
1. Concept explanation
2. Step-by-step solution
3. Why the answer is ${isCorrect ? 'correct' : 'incorrect'}
4. Key takeaway
5. Study tips

Make it thorough and educational.`;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const fullExplanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Detailed explanation not available.';
      
      return {
        isCorrect,
        explanation: fullExplanation,
        detailedExplanation: fullExplanation,
        correctAnswer: correctAnswer?.text || 'Unknown',
        userAnswer: selectedAnswer?.text || 'No answer'
      };
    } catch (error) {
      console.error('Error getting explanation:', error);
      const correctAnswer = question.answers.find((a: any) => a.is_correct);
      return {
        isCorrect,
        explanation: `The correct answer is ${correctAnswer?.text}. ${isCorrect ? 'Good job!' : 'Keep practicing!'}`,
        detailedExplanation: `The correct answer is ${correctAnswer?.text}. ${isCorrect ? 'Great work!' : 'Review the material and try again.'}`,
        correctAnswer: correctAnswer?.text || 'Unknown',
        userAnswer: question.answers.find((a: any) => a.id === userAnswerId)?.text || 'No answer'
      };
    } finally {
      setLoadingExplanation(null);
    }
  };

  const calculateLocalResult = (): SubmitResponse => {
    if (!exam) {
      throw new Error('Exam data not available');
    }

    let correctAnswers = 0;
    const totalQuestions = exam.questions?.length || 0;

    exam.questions?.forEach((question) => {
      const selectedAnswerId = answers[question.id];
      if (selectedAnswerId !== 0) {
        const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId);
        if (selectedAnswer?.is_correct) {
          correctAnswers++;
        }
      }
    });

    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    const endTime = new Date();
    const timeSpentSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);

    return {
      score: Math.round(score),
      correctAnswers,
      incorrectAnswers,
      totalQuestions,
      timeSpent: timeSpentMinutes,
      passed: score >= 70,
      percentage: Math.round(score)
    };
  };

  const calculateAndSubmitResult = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    const localResult = calculateLocalResult();
    console.log('Local result calculated:', localResult);
    
    const explanationsMap: Explanation = {};
    
    for (const question of exam?.questions || []) {
      const userAnswerId = answers[question.id];
      if (userAnswerId === 0) {
        const correctAnswer = question.answers.find(a => a.is_correct);
        explanationsMap[question.id] = {
          isCorrect: false,
          explanation: `You didn't answer this question. Correct answer: ${correctAnswer?.text}`,
          detailedExplanation: `Review: ${question.text}\nCorrect answer: ${correctAnswer?.text}`,
          correctAnswer: correctAnswer?.text || 'Unknown',
          userAnswer: 'Not answered'
        };
      } else {
        const selectedAnswer = question.answers.find(a => a.id === userAnswerId);
        const isCorrect = selectedAnswer?.is_correct || false;
        const explanation = await getDetailedExplanationFromGemini(question, userAnswerId, isCorrect);
        explanationsMap[question.id] = explanation;
      }
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'ae-exam-previous-attempt',
        JSON.stringify({
          result: localResult,
          examTitle: exam?.title,
          questions: exam?.questions,
        })
      );
    }
    
    navigate(`/exam/${id}/result`, { 
      state: { 
        result: localResult,
        examTitle: exam?.title,
        explanations: explanationsMap,
        questions: exam?.questions,
        userAnswers: answers
      } 
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Error Loading Exam</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
            Try Again
          </button>
          <Link to="/" className="mt-3 ml-2 inline-block text-blue-500 hover:underline">
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  if (!exam || timeLeft === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = exam.questions?.[currentQuestionIndex];
  const totalQuestions = exam.questions?.length || 0;
  const answeredCount = Object.values(answers).filter(id => id !== 0).length;
  const isCurrentQuestionAnswered = currentQuestion ? answers[currentQuestion.id] !== 0 : false;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <div className="text-lg font-mono font-bold text-red-600">
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>📊 Progress: {answeredCount} / {totalQuestions} answered</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two-column layout: Question numbers (left) + Current question (right) */}
      <div className="flex gap-6">
        {/* LEFT SIDEBAR - Question Numbers as Squares */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Question Navigator
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {exam.questions?.map((_, idx) => {
                const isAnswered = answers[exam.questions![idx].id] !== 0;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`
                      aspect-square rounded-lg font-semibold text-sm transition-all
                      flex items-center justify-center
                      ${isCurrent 
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-105' 
                        : isAnswered 
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            {/* Stats summary in sidebar */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold text-green-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unanswered:</span>
                  <span className="font-semibold text-red-600">{totalQuestions - answeredCount}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-blue-600">
                    {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT - Current Question */}
        <div className="flex-1">
          {currentQuestion && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-1">
                    {currentQuestion.text}
                  </h2>
                </div>
                {isCurrentQuestionAnswered && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                    ✓ Answered
                  </span>
                )}
              </div>
              
              <div className="space-y-3 mt-6">
                {currentQuestion.answers.map((answer) => (
                  <label
                    key={answer.id}
                    className={`
                      flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all
                      ${answers[currentQuestion.id] === answer.id 
                        ? 'bg-blue-50 border-2 border-blue-500' 
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={answer.id}
                      checked={answers[currentQuestion.id] === answer.id}
                      onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 flex-1">{answer.text}</span>
                    {answers[currentQuestion.id] === answer.id && (
                      <span className="text-blue-600 text-sm font-semibold">Selected</span>
                    )}
                  </label>
                ))}
              </div>
              
              {loadingExplanation === currentQuestion.id && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">🤔 Generating AI explanation...</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4 mt-8">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`
                    px-6 py-2 rounded-lg font-semibold transition-colors
                    ${currentQuestionIndex === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                    }
                  `}
                >
                  ← Previous
                </button>
                
                <button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className={`
                    px-6 py-2 rounded-lg font-semibold transition-colors
                    ${currentQuestionIndex === totalQuestions - 1 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                    }
                  `}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={calculateAndSubmitResult}
          disabled={submitting}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-lg font-semibold transition-colors"
        >
          {submitting ? '📚 Getting AI Explanations...' : '✅ Submit Exam & Get AI Explanations'}
        </button>
      </div>
    </div>
  );
};

export default TakeExam;