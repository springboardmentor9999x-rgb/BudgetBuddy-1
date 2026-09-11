import { FaArrowCircleLeft, FaExclamationTriangle } from "react-icons/fa";
import { Link } from "react-router";

const NotFound = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 text-center border border-slate-700">
          {/* Icon with minimal styling */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-700/50 p-5 rounded-full">
              <FaExclamationTriangle
                size={56}
                className="text-amber-400 sm:text-6xl"
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-200 tracking-tight">
            Oops!
          </h1>
          <p className="mt-2 text-xl font-semibold text-indigo-400">
            Page not found
          </p>
          <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>

          <Link
            to="/dashboard"
            className="mt-8 group inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            <FaArrowCircleLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="ml-3">Go to Dashboard</span>
          </Link>

          {/* Simple divider line */}
          <div className="mt-6 w-16 h-0.5 bg-slate-600 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;