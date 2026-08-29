import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExam } from '../services/api';
import type { Exam } from '../services/api';
import SafeHtml from '../components/SafeHtml';

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
      const examData = await getExam(parseInt(id!, 10));
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
        <h1 className="text-3xl font-bold mb-4"><SafeHtml html={exam.title} /></h1>
        <div className="text-gray-600 mb-6"><SafeHtml html={exam.description} /></div>

        {/*
          Note: passages, questions, and answers are NOT available here.
          ExamDetailView returns ExamListSerializer, which only exposes the
          metadata fields below. Full exam content (questions, passages)
          is only returned by POST /exams/<id>/start/, inside
          StartExamResponse.exam (ExamTakeSerializer). Render that content
          on the "take exam" screen instead, sourced from startExam().
        */}

        <div className="border-t border-b py-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Duration:</span>
            <span>{exam.duration_minutes} minutes</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Status:</span>
            <span>{exam.is_available ? 'Available' : 'Not available'}</span>
          </div>
          {exam.requires_password && (
            <div className="flex justify-between">
              <span className="font-semibold">Access:</span>
              <span>Password required</span>
            </div>
          )}
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