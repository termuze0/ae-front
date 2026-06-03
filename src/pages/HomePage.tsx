import React, { useState, useEffect } from 'react';
import { getExams, testConnection, type Exam } from '../services/api';
import ExamCard from '../components/ExamCard';

const HomePage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching exams from API...');
        
        const examData = await getExams();
        console.log('✅ Exams received:', examData);
        
        setExams(examData);
        setError('');
        setErrorDetails('');
      } catch (err: any) {
        console.error('❌ Full error object:', err);
        
        // Get detailed error information
        let errorMsg = 'Failed to load exams';
        let details = '';
        
        if (err.message) {
          errorMsg = err.message;
          details = err.message;
        }
        
        if (err.code) {
          details += ` (Code: ${err.code})`;
        }
        
        if (err.response) {
          details += ` - Server responded with status: ${err.response.status}`;
          console.error('Response data:', err.response.data);
        } else if (err.request) {
          details += ' - No response received from server';
          console.error('Request was made but no response:', err.request);
        }
        
        setError(errorMsg);
        setErrorDetails(details);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
    
    // Optional: Test connection
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <strong className="font-bold">Error: </strong>
          <span>{error}</span>
          {errorDetails && (
            <div className="mt-2 text-sm font-mono">
              <strong>Details:</strong> {errorDetails}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
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