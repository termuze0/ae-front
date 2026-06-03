import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { SubmitResponse } from '../services/api';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const { result } = (location.state as { result: SubmitResponse }) || {};

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No results found. Please take an exam first.</p>
        <Link to="/" className="text-blue-500 mt-4 inline-block">
          Go to Exams
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Exam Results</h1>
        
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {result.percentage}%
          </div>
          <p className="text-gray-600">
            You got {result.correctAnswers} out of {result.totalQuestions} correct
          </p>
          <p className="text-lg font-semibold mt-2">
            {result.passed ? '✅ Passed!' : '❌ Failed'}
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-semibold">{result.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-semibold text-green-600">{result.correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span>Incorrect Answers:</span>
              <span className="font-semibold text-red-600">{result.incorrectAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span>Score:</span>
              <span className="font-semibold">{result.score}%</span>
            </div>
            <div className="flex justify-between">
              <span>Time Spent:</span>
              <span className="font-semibold">{result.timeSpent} minutes</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 inline-block"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;