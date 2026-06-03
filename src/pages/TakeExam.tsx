import React, { useState, useEffect } from 'react';
import {Link , useParams, useNavigate } from 'react-router-dom';
import { getExam } from '../services/api';
import type { Exam, AnswerSheet, SubmitResponse } from '../services/api';

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<AnswerSheet>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState<Date>(new Date());

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
      
      // Initialize answers object
      const initialAnswers: AnswerSheet = {};
      examData.questions?.forEach((question) => {
        initialAnswers[question.id] = 0; // 0 means no answer selected
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError(error instanceof Error ? error.message : 'Failed to load exam. Please try again.');
    }
  };

  // Timer effect
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

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && exam && !submitting) {
      calculateAndSubmitResult();
    }
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

  // Calculate results locally
  const calculateLocalResult = (): SubmitResponse => {
    if (!exam) {
      throw new Error('Exam data not available');
    }

    let correctAnswers = 0;
    const totalQuestions = exam.questions?.length || 0;

    // Calculate correct answers
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
    
    // Calculate time spent
    const endTime = new Date();
    const timeSpentSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);

    return {
      score: Math.round(score),
      correctAnswers,
      incorrectAnswers,
      totalQuestions,
      timeSpent: timeSpentMinutes,
      passed: score >= 70, // 70% is passing score
      percentage: Math.round(score)
    };
  };

  const calculateAndSubmitResult = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    // Small delay to show submitting state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Calculate result locally
    const localResult = calculateLocalResult();
    console.log('Local result calculated:', localResult);
    
    // Navigate to result page with local result
    navigate(`/exam/${id}/result`, { 
      state: { 
        result: localResult,
        examTitle: exam?.title 
      } 
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Error Loading Exam</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
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

  const answeredCount = Object.values(answers).filter(id => id !== 0).length;
  const totalQuestions = exam.questions?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with timer and progress */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="text-xl font-mono font-bold text-red-600">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Progress: {answeredCount} / {totalQuestions} answered</span>
          <div className="w-48 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
              style={{ width: totalQuestions > 0 ? `${(answeredCount / totalQuestions) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {exam.questions && exam.questions.length > 0 ? (
          exam.questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Question {index + 1}: {question.text}
              </h3>
              <div className="space-y-3">
                {question.answers && question.answers.map((answer) => (
                  <label
                    key={answer.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      answers[question.id] === answer.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={answer.id}
                      checked={answers[question.id] === answer.id}
                      onChange={() => handleAnswerSelect(question.id, answer.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700 flex-1">{answer.text}</span>
                    {answers[question.id] === answer.id && (
                      <span className="text-blue-600 text-sm">✓ Selected</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No questions available for this exam.</div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={calculateAndSubmitResult}
          disabled={submitting}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-lg font-semibold transition-colors"
        >
          {submitting ? 'Calculating Results...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default TakeExam;