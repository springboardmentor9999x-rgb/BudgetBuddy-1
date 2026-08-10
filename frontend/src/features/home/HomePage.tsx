import { FcMoneyTransfer } from "react-icons/fc";
import {
  FaArrowRight,
  FaChartLine,
  FaPiggyBank,
  FaShieldAlt,
} from "react-icons/fa";
import { setPageTitle } from "../../utils/setTitle.ts";

const HomePage = () => {
  setPageTitle("BudgetBuddy");

  return (
    <>
      <main className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo with glow effect */}
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl scale-150" />
              <div className="relative bg-linear-to-br from-slate-800/50 to-slate-900/50 p-4 sm:p-5 rounded-full backdrop-blur-sm border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                <FcMoneyTransfer
                  size={80}
                  className="sm:size-24"
                />
              </div>
            </div>

            {/* Main heading with gradient */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight">
              <span className="bg-linear-to-r from-indigo-300 via-white to-indigo-300 bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                BudgetBuddy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-300/80 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Your personal finance companion — track expenses,
              save smarter, and achieve your financial goals with
              ease.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-12 sm:mb-16">
              <a
                href="/login"
                className="group relative inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 ease-out overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>

              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 sm:py-4 text-base sm:text-lg font-medium text-gray-200 border border-indigo-500/30 rounded-2xl hover:bg-indigo-500/10 hover:border-indigo-400 hover:text-white transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </a>
            </div>

            {/* Feature badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <FaChartLine className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm sm:text-base text-gray-300">
                  Track Spending
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <FaPiggyBank className="text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm sm:text-base text-gray-300">
                  Save More
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group">
                <FaShieldAlt className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm sm:text-base text-gray-300">
                  Secure & Safe
                </span>
              </div>
            </div>

            {/* Footer note */}
            <p className="mt-8 sm:mt-10 text-xs sm:text-sm text-gray-500/60">
              Join thousands of happy users managing their
              finances with BudgetBuddy
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;