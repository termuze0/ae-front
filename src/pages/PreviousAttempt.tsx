import React from 'react';
import { Link } from 'react-router-dom';

const PreviousAttempt: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Coming Soon</h1>
        <p className="text-lg text-slate-600 mb-8">
          This feature is under development. Check back later for previous attempt review and analytics.
        </p>
        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PreviousAttempt;
