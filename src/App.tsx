import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ExamDetails from './pages/ExamDetails';
import TakeExam from './pages/TakeExam';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exam/:id" element={<ExamDetails />} />
          <Route path="/exam/:id/take" element={<TakeExam />} />
          <Route path="/exam/:id/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;