import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExamHistory } from '../services/api';
import type { ExamHistoryItem } from '../services/api';

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
};

const PreviousAttempt: React.FC = () => {
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExamHistory();
      setHistory(data);
    } catch (err: any) {
      console.error('Error fetching exam history:', err);
      setError(err?.message || 'Failed to load your exam history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p>Loading your exam history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto">
          <p>{error}</p>
          <button
            onClick={fetchHistory}
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

  if (history.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">No attempts yet</h1>
          <p className="text-lg text-slate-600 mb-8">
            You haven't taken any exams yet. Once you do, they'll show up here.
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Browse Exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Your Previous Attempts</h1>

      <div className="space-y-4">
        {history.map((item) => {
          const percentage = item.result?.percentage ?? item.percentage;
          const passed = item.result?.passed ?? item.passed;
          const isGraded = item.submitted && percentage !== undefined;

          const examTitle = typeof item.exam === 'object' && item.exam !== null
            ? item.exam.title
            : (item.exam_title || `Exam #${item.exam}`);

          return (
            <div key={item.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {examTitle}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Started {formatDate(item.started_at)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {!item.submitted && (
                    <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                      In progress
                    </span>
                  )}
                  {item.submitted && isGraded && (
                    <>
                      <div
                        className={`text-2xl font-bold ${
                          passed ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {Math.round(percentage!)}%
                      </div>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          passed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </>
                  )}
                  {item.submitted && !isGraded && (
                    <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                      Submitted
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviousAttempt;