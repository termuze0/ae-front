import React from 'react';
import { Link } from 'react-router-dom';
import type { Exam } from '../services/api';

interface ExamCardProps {
  exam: Exam;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {exam.title}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {exam.description}
        </p>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>⏱️ {exam.duration_minutes} minutes</span>
          <span>📝 {exam.questions?.length ?? exam.total_questions ?? 0} questions</span>
        </div>

        <Link
          to={`/exam/${exam.id}`}
          className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Start Exam
        </Link>
      </div>
    </div>
  );
};

export default ExamCard;