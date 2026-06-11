import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExam, getPassage } from '../services/api';
import type { Exam, Passage } from '../services/api';

const ExamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [passage, setPassage] = useState<Passage | null>(null);
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
      // If backend only provides a passage id, fetch it
      try {
        const pid = typeof examData.passage === 'number' ? examData.passage : examData.passage_id;
        if (pid) {
          const p = await getPassage(pid as number);
          setPassage(p);
        }
      } catch (err) {
        console.warn('Failed to fetch exam passage', err);
      }
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
        {/* Render exam-level passage if provided by backend (may be null). Use fetched `passage` as fallback. */}
        {(exam.passage || passage) && (
          <div className="mb-6">
            {(() => {
              const raw = exam.passage ?? passage;
              let text: string | undefined;
              let url: string | undefined;

              if (typeof raw === 'string') {
                text = raw;
                url = /^(https?:)?\/\//.test(raw) ? raw : undefined;
              } else if (typeof raw === 'number') {
                // we attempted to fetch the passage into `passage` state earlier
                if (passage) {
                  text = passage.content ?? passage.title;
                  url = passage.image ?? undefined;
                }
              } else if (raw && typeof raw === 'object') {
                text = (raw as Passage).content ?? (raw as Passage).title;
                url = (raw as any).image ?? (raw as any).url;
              }

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

              const finalUrl = buildImageUrl(url);
              const looksLikeImage = (u?: string) => !!u && /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(u);

              if (finalUrl && looksLikeImage(finalUrl)) {
                return (
                  <div className="rounded border p-2">
                    <img src={finalUrl} alt="Passage" className="max-w-full h-auto mx-auto" />
                  </div>
                );
              }

              if (text) {
                return (
                  <div className="rounded border p-4 bg-gray-50 text-gray-800">{text}</div>
                );
              }

              return <pre className="rounded border p-2 bg-gray-50 text-xs overflow-auto">{JSON.stringify(raw)}</pre>;
            })()}
          </div>
        )}
        
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