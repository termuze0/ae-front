import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/ae.jpg';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
      return;
    }

    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-200">
            <img
              src={logo}
              alt="AE Exam Logo"
              className="w-10 h-10 rounded-full bg-white p-1 object-cover shadow"
            />

            <div>
              <h1 className="text-white text-xl md:text-2xl font-bold">
                AE Exam
              </h1>
              <p className="text-xs text-purple-100 hidden sm:block">
                Grade 12 Entrance Preparation
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-white hover:text-purple-200 transition-colors font-medium">
              Home
            </Link>
            <Link to="/previous-attempt" className="text-white hover:text-purple-200 transition-colors font-medium">
              Previous Attempt
            </Link>
            <Link to="/about" className="text-white hover:text-purple-200 transition-colors font-medium">
              About
            </Link>
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <span className="text-sm text-white/90">
                Hi, {user.name || user.username || user.email?.split('@')[0] || 'there'}
              </span>
            )}
            <button
              onClick={handleAuthAction}
              className="bg-white text-purple-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 hover:shadow-md transition-all duration-300"
            >
              {isAuthenticated ? 'Logout' : 'Login / Register'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() =>
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }
              className="text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-purple-500 py-4">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Home
              </Link>

              <Link
                to="/previous-attempt"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Previous Attempt
              </Link>

              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                About
              </Link>

              <button
                onClick={() => {
                  handleAuthAction();
                  setIsMobileMenuOpen(false);
                }}
                className="mt-2 bg-white text-purple-700 px-4 py-2 rounded-full font-semibold"
              >
                {isAuthenticated ? 'Logout' : 'Login / Register'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;