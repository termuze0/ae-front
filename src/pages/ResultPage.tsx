import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import type { SubmitResponse, Question } from '../services/api';

interface ExplanationData {
  isCorrect: boolean;
  explanation: string;
  detailedExplanation: string;
  correctAnswer: string;
  userAnswer: string;
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const [showExplanations, setShowExplanations] = useState(false);
  
  const result = location.state?.result as SubmitResponse;
  const examTitle = location.state?.examTitle as string;
  const explanations = location.state?.explanations as Record<number, ExplanationData>;
  const questions = location.state?.questions as Question[];

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>No results found. Please take an exam first.</p>
          <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Go to Exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Exam Results</h1>
        {examTitle && <p className="text-center text-gray-600 mb-8">{examTitle}</p>}
        
        {/* Score Display */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">{result.percentage}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#e5e7eb" strokeWidth="12" fill="none" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#3b82f6"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.percentage / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        {/* Pass/Fail Message */}
        <div className="text-center mb-8">
          <div className={`text-2xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.passed ? '🎉 Congratulations! You Passed! 🎉' : '😢 Keep Learning! You\'ll Get It Next Time! 😢'}
          </div>
          <p className="text-gray-600 mt-2">
            You got {result.correctAnswers} out of {result.totalQuestions} correct
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct Answers</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{result.incorrectAnswers}</div>
            <div className="text-sm text-gray-600">Incorrect Answers</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{result.totalQuestions}</div>
            <div className="text-sm text-gray-600">Total Questions</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{result.timeSpent}</div>
            <div className="text-sm text-gray-600">Minutes Spent</div>
          </div>
        </div>

        {/* Toggle Detailed Explanations Button */}
        {explanations && Object.keys(explanations).length > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              {showExplanations ? '📖 Hide Detailed Explanations' : '🤖 Show Detailed AI Explanations'}
            </button>
          </div>
        )}

        {/* Detailed Explanations */}
        {showExplanations && explanations && questions && (
          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4">📚 Detailed AI-Powered Explanations</h2>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const explanation = explanations[question.id];
                if (!explanation) return null;
                
                return (
                  <div key={question.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg">
                        Question {index + 1}: {question.text}
                      </h3>
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        explanation.isCorrect 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {explanation.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <p><span className="font-semibold">Your answer:</span> {explanation.userAnswer}</p>
                      <p><span className="font-semibold">Correct answer:</span> {explanation.correctAnswer}</p>
                    </div>
                    
                    {/* Detailed Explanation Content */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="prose max-w-none">
                        {explanation.detailedExplanation.split('\n').map((paragraph, i) => (
                          <p key={i} className="mb-2 text-gray-700">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Back to Exams
          </Link>
          <button onClick={() => window.location.reload()} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
            Take Another Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;