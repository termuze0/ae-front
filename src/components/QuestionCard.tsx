import React from 'react';
import type { Question, Answer } from '../services/api';

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedAnswerId: number | null;
  onAnswerSelect: (answerId: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  index, 
  selectedAnswerId, 
  onAnswerSelect 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Question {index + 1}
        </h3>
        <p className="text-gray-700">{question.text}</p>
      </div>
      
      <div className="space-y-3">
        {question.answers.map((answer: Answer) => (
          <label
            key={answer.id}
            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={answer.id}
              checked={selectedAnswerId === answer.id}
              onChange={() => onAnswerSelect(answer.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-700 flex-1">
              {String.fromCharCode(65 + answer.id % 4)}. {answer.text}
            </span>
          </label>
        ))}
      </div>

      {selectedAnswerId !== null && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-green-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Answer selected
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;