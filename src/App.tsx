import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ExamDetails from './pages/ExamDetails';
import TakeExam from './pages/TakeExam';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PreviousAttempt from './pages/PreviousAttempt';
import AboutPage from './pages/AboutPage';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/exam/:id" element={<ExamDetails />} />
            <Route
              path="/exam/:id/take"
              element={
                <RequireAuth>
                  <TakeExam />
                </RequireAuth>
              }
            />
            <Route
              path="/exam/:id/result"
              element={
                <RequireAuth>
                  <ResultPage />
                </RequireAuth>
              }
            />
            <Route path="/previous-attempt" element={<PreviousAttempt />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;