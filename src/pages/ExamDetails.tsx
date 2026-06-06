import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExam } from '../services/api';
import type { Exam } from '../services/api';

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchExamDetails();
    }
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching exam ${id}...`);
      const examData = await getExam(parseInt(id!));
      console.log('Exam data received:', examData);
      setExam(examData);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError('Failed to load exam details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Exam not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4">{exam.title}</h1>
        <p className="text-gray-600 mb-6">{exam.description}</p>
        
        <div className="border-t border-b py-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Duration:</span>
            <span>{exam.duration_minutes ?? exam.duration ?? 0} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Total Questions:</span>
            <span>{exam.questions?.length ?? exam.total_questions ?? 0}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to={`/exam/${id}/take`}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Start Exam Now
          </Link>
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Back to Exams
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ExamDetails;