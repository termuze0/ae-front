import React, { useState, useEffect } from 'react';
import { getExams, testConnection, type Exam } from '../services/api';
import ExamCard from '../components/ExamCard';

const HomePage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  const fetchExams = async () => {
    try {
      setLoading(true);
      
      const examData = await getExams();
      
      setExams(examData);
      setError('');
      setErrorDetails('');
    } catch (err: any) {
      if (import.meta.env.DEV) {
        // DEV MODE: Show full detailed error info in the UI
        console.error('❌ Detailed fetch error:', err);

        let devMessage = err.message || 'Failed to load exams';
        let devDetails = '';

        if (err.code) devDetails += `[Code: ${err.code}] `;
        if (err.response) {
          devDetails += `Status: ${err.response.status} - ${JSON.stringify(err.response.data)}`;
        } else if (err.request) {
          devDetails += 'No response received from server.';
        }

        setError(devMessage);
        setErrorDetails(devDetails);
      } else {
        // PRODUCTION MODE: User-friendly clean error messages
        let userMessage = 'Unable to load exams right now. Please try again in a moment.';

        if (!navigator.onLine) {
          userMessage = 'Network disconnected. Please check your internet connection.';
        } else if (err.response) {
          const status = err.response.status;
          if (status >= 500) {
            userMessage = 'Our servers are currently experiencing issues. We are working to fix this.';
          } else if (status === 404) {
            userMessage = 'The requested exam data could not be found.';
          } else if (status === 401 || status === 403) {
            userMessage = 'You do not have permission to view these exams. Please log in again.';
          }
        } else if (err.request) {
          userMessage = 'Could not reach the server. Please check your connection and try again.';
        }

        setError(userMessage);
        setErrorDetails(''); // Keep tech details hidden in production
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm text-center">
          {/* Warning Icon Badge */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-600 mb-4">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {import.meta.env.DEV ? 'Development Error' : 'Something went wrong'}
          </h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {error}
          </p>

          {/* Details box visible when errorDetails is populated (e.g. in DEV) */}
          {errorDetails && (
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-red-600 text-left overflow-x-auto break-words">
              <strong>Dev Details:</strong> {errorDetails}
            </div>
          )}

          <button
            onClick={fetchExams}
            className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Exams</h1>
      {exams.length === 0 ? (
        <p className="text-gray-500 text-center">No exams available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;