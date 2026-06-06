import React from 'react';
import { Link } from 'react-router-dom';
import type { SubmitResponse, Question } from '../services/api';

interface StoredAttempt {
  result: SubmitResponse;
  examTitle?: string;
  questions?: Question[];
}

const PreviousAttempt: React.FC = () => {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem('ae-exam-previous-attempt') : null;
  const attempt: StoredAttempt | null = stored ? JSON.parse(stored) : null;

  if (!attempt || !attempt.result) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-8 rounded-lg max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-3">No Previous Attempt Found</h1>
          <p className="mb-4">Complete an exam first, and your most recent result will appear here.</p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const { result, examTitle, questions } = attempt;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Previous Attempt</h1>
        {examTitle && <p className="text-gray-600 mb-6">Exam: {examTitle}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-blue-600">{result.percentage}%</div>
            <p className="text-gray-600">Score</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-600">{result.correctAnswers}</div>
            <p className="text-gray-600">Correct Answers</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-red-600">{result.incorrectAnswers}</div>
            <p className="text-gray-600">Incorrect Answers</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-purple-600">{result.timeSpent}</div>
            <p className="text-gray-600">Minutes Spent</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className={`text-xl font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.passed ? 'You passed this attempt!' : 'Keep going — you can improve next time!'}
          </p>
        </div>

        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PreviousAttempt;
