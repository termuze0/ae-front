import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About AE Exam</h1>
      <p className="text-gray-700 mb-4">
        AE Exam is designed to help Grade 12 students prepare for entrance exams with
        a clean, simple experience. Use the app to take practice exams, review your
        past results, and improve your performance.
      </p>
      <p className="text-gray-700 mb-4">
        The Previous Attempt page shows your most recent exam result saved locally in
        the browser. If you haven&apos;t completed an exam yet, take one from the home page.
      </p>
      <Link
        to="/"
        className="inline-block mt-4 bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
      >
        Back to Home
      </Link>
    </div>
  </div>
);

export default AboutPage;
