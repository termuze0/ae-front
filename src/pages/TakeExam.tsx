import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { startExam, submitExam } from '../services/api';
import type { ExamTake, AnswerSheet, SubmitResponse, Passage } from '../services/api';

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamTake | null>(null);
  const [answers, setAnswers] = useState<AnswerSheet>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [needsPassword, setNeedsPassword] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchExam();
    }
  }, [id]);

  const fetchExam = async (password?: string) => {
    try {
      setError(null);
      const { exam: examData } = await startExam(parseInt(id!, 10), password);

      setExam(examData);
      setNeedsPassword(false);
      setTimeLeft(examData.duration_minutes * 60);

      const initialAnswers: AnswerSheet = {};
      examData.questions?.forEach((question) => {
        initialAnswers[question.id] = null;
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      // StartExamView returns 400 with a password-related detail when a
      // password is required or the one supplied was wrong.
      if (err?.status === 400 && /password/i.test(err?.message || '')) {
        setNeedsPassword(true);
        if (password) setError('Incorrect password. Please try again.');
        return;
      }
      console.error('Error fetching exam:', err);
      setError(err?.message || 'Failed to load exam. Please try again.');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExam(passwordInput);
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

  // Auto-submit when the timer runs out.
  useEffect(() => {
    if (timeLeft === 0 && exam && !submitting) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSubmit = async () => {
    if (submitting || !id) return;
    setSubmitting(true);
    setError(null);

    try {
      const result: SubmitResponse = await submitExam(parseInt(id, 10), answers);

      navigate(`/exam/${id}/result`, {
        state: {
          result,
          examTitle: exam?.title,
          questions: exam?.questions,
          userAnswers: answers,
        },
      });
    } catch (err: any) {
      console.error('Error submitting exam:', err);
      setError(err?.message || 'Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  };

  const buildImageUrl = (u?: string | null) => {
    if (!u) return undefined;
    if (/^https?:\/\//i.test(u) || u.startsWith('/')) return u;
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud) return u;
    let cleaned = u.replace(/^\/+/, '');
    if (!cleaned.includes('/') && !/^image\/upload\//i.test(cleaned)) {
      cleaned = `image/upload/${cleaned}`;
    }
    return `https://res.cloudinary.com/${cloud}/${cleaned}`;
  };

  const looksLikeImage = (u?: string) => !!u && /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(u);

  const renderPassage = (passage: Passage | null | undefined) => {
    if (!passage) return null;
    const finalUrl = buildImageUrl(passage.image);
    const text = passage.content || passage.title;

    if (finalUrl && looksLikeImage(finalUrl)) {
      return (
        <div className="mb-4 rounded border p-2">
          <img src={finalUrl} alt={passage.title || 'Passage image'} className="max-w-full h-auto mx-auto" />
        </div>
      );
    }
    if (text) {
      return <div className="mb-4 rounded border p-4 bg-gray-50 text-gray-800">{text}</div>;
    }
    return null;
  };

  if (needsPassword) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">This exam requires a password</h2>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
            placeholder="Enter exam password"
            autoFocus
          />
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Continue
            </button>
            <Link to="/" className="px-4 py-2 text-gray-600 hover:underline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Error Loading Exam</h2>
          <p>{error}</p>
          <button onClick={() => fetchExam()} className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">
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
  const answeredCount = Object.values(answers).filter((id) => id !== null).length;
  const isCurrentQuestionAnswered = currentQuestion ? answers[currentQuestion.id] !== null : false;

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
              style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
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
              {exam.questions?.map((q, idx) => {
                const isAnswered = answers[q.id] !== null;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
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

              {renderPassage(currentQuestion.passage)}

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
      
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-lg font-semibold transition-colors"
        >
          {submitting ? 'Submitting...' : '✅ Submit Exam'}
        </button>
      </div>
    </div>
  );
};

export default TakeExam;