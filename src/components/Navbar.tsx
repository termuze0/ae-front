import { useState } from "react";
import logo from "../assets/ae.jpg";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAuthAction = () => {
    setIsLoggedIn(!isLoggedIn);
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
            <a
              href="#"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Home
            </a>

            <a
              href="#"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Exams
            </a>

            <a
              href="#"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Subjects
            </a>

            <a
              href="#"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Results
            </a>

            <a
              href="#"
              className="text-white hover:text-purple-200 transition-colors font-medium"
            >
              Contact
            </a>
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            <button
              onClick={handleAuthAction}
              className="bg-white text-purple-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 hover:shadow-md transition-all duration-300"
            >
              {isLoggedIn ? "Logout" : "Login / Register"}
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
              <a
                href="#"
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Home
              </a>

              <a
                href="#"
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Exams
              </a>

              <a
                href="#"
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Subjects
              </a>

              <a
                href="#"
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Results
              </a>

              <a
                href="#"
                className="text-white px-2 py-2 rounded hover:bg-purple-500"
              >
                Contact
              </a>

              <button
                onClick={handleAuthAction}
                className="mt-2 bg-white text-purple-700 px-4 py-2 rounded-full font-semibold"
              >
                {isLoggedIn ? "Logout" : "Login / Register"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;