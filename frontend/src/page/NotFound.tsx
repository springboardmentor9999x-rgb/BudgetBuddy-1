import { FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center background-color px-4">
      <div className="max-w-lg w-full bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 sm:p-10 text-center border border-white/10 transition-transform hover:scale-[1.01] duration-200">
        {/* Illustration (SVG) */}
        <div className="flex justify-center mb-6">
          <svg
            className="w-48 h-48 sm:w-56 sm:h-56"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="80" fill="#E2E8F0" />
            <path
              d="M70 90 L130 90 L130 130 L70 130 L70 90Z"
              fill="#94A3B8"
              stroke="#475569"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M85 70 L115 70 L130 90 L70 90 L85 70Z"
              fill="#CBD5E1"
              stroke="#475569"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <circle cx="85" cy="110" r="6" fill="#1E293B" />
            <circle cx="115" cy="110" r="6" fill="#1E293B" />
            <path
              d="M90 125 Q100 135 110 125"
              stroke="#1E293B"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <text
              x="100"
              y="170"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill="#1E293B"
            >
              404
            </text>
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-400 tracking-tight">
          Oops!
        </h1>
        <p className="mt-2 text-xl font-semibold text-gray-300">
          Page not found
        </p>
        <p className="mt-3 text-gray-300 text-sm sm:text-base max-w-sm mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <button
          onClick={handleGoDashboard}
          className="mt-8 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 px-8 rounded-full transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 flex items-center justify-center mx-auto"
        >
          <span><FaArrowCircleLeft /></span> <span className="ml-2">Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFound;