import React, { useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import API from '../services/api';
import type { Question } from '../services/api';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmStage, setConfirmStage] = useState(0); // 0 = not prepared, 1 = prepared (awaiting final confirm)
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  
  const examTitle = location.state?.examTitle as string;
  const questions = location.state?.questions as Question[];
  const userAnswers = location.state?.userAnswers as Record<number, number> | undefined;
  const { id: examIdParam } = useParams<{ id: string }>();
  const examId = examIdParam ? parseInt(examIdParam, 10) : undefined;



  const buildPayload = () => {
    const payloadAnswers: Array<{ question_id: number; answer_id: number | null }> = [];
    if (!questions) return payloadAnswers;

    for (const q of questions) {
      const answerId = userAnswers ? userAnswers[q.id] : undefined;
      if (answerId === undefined) {
        payloadAnswers.push({ question_id: q.id, answer_id: null });
      } else {
        payloadAnswers.push({ question_id: q.id, answer_id: answerId || null });
      }
    }

    return payloadAnswers;
  };

  const handlePrepare = () => setConfirmStage(1);
  const handleCancelPrepare = () => setConfirmStage(0);

  const handleConfirmSubmit = async () => {
    if (submitting || submitted) return;
    if (!examId) {
      setServerMessage('Exam id missing — cannot submit.');
      return;
    }

    const payload = { answers: buildPayload() };

    try {
      setSubmitting(true);
      setServerMessage(null);
      const resp = await API.post(`/exams/${examId}/submit/`, payload);
      console.debug('Submission response:', resp.data);
      setServerMessage('Submission successful.');
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submit failed:', err);
      setServerMessage(err?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Exam Results</h1>
        {examTitle && <p className="text-center text-gray-600 mb-8">{examTitle}</p>}
        
        {submitted ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Submitted — Awaiting Result</h2>
            <p className="text-gray-600 mb-4">Your answers have been submitted. Please wait while your submission is graded by the instructor or automatic grader.</p>
            {serverMessage && <p className="text-sm text-gray-700">{serverMessage}</p>}
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-lg font-medium">Results are currently hidden. Please review your answers and submit them to record your attempt.</p>
              <p className="text-sm text-gray-600 mt-2">Two-step submission: click <strong>Prepare to submit</strong>, then confirm.</p>
            </div>

            {/* Simple review list */}
            {questions && (
              <div className="space-y-4 mb-6">
                {questions.map((q, idx) => {
                  const userAnswerId = userAnswers ? userAnswers[q.id] : undefined;
                  const userAnswerText = q.answers.find(a => a.id === userAnswerId)?.text || 'No answer';
                  return (
                    <div key={q.id} className="border rounded p-4">
                      <div className="font-semibold">Question {idx + 1}</div>
                      <div className="text-sm text-gray-700 mt-1">{q.text}</div>
                      <div className="text-sm text-gray-600 mt-2"><strong>Your answer:</strong> {userAnswerText}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center gap-4">
              {confirmStage === 0 ? (
                <button
                  onClick={handlePrepare}
                  className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
                >
                  Prepare to submit (Step 1)
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelPrepare}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={submitting}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Confirm and Submit (Step 2)'}
                  </button>
                </>
              )}
            </div>

            {serverMessage && (
              <div className="mt-4 text-center text-sm text-gray-700">{serverMessage}</div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Back to Exams
          </Link>
          <button onClick={() => window.location.reload()} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
            Take Another Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;