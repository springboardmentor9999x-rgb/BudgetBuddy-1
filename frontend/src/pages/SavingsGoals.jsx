import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiArrowLeft,
  FiTarget,
} from "react-icons/fi";

import SavingsGoalForm from "../components/SavingsGoalForm";
import SavingsGoalList from "../components/SavingsGoalList";

function SavingsGoals() {
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);

  const handleGoalCreated = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb]">

      {/* ================= HEADER ================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-5 sm:px-7">

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <FiArrowLeft />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiTarget />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#071a2b]">
              Savings Goals
            </h1>

            <p className="text-xs text-slate-500">
              Plan, track and achieve your financial goals
            </p>
          </div>

        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-7 lg:py-10">

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
            Financial Goals
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#071a2b]">
            Build your savings
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Create savings goals, monitor your progress and stay on track
            toward the things that matter to you.
          </p>
        </div>

        {/* ================= GOALS ================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          <SavingsGoalForm
            onGoalCreated={handleGoalCreated}
          />

          <SavingsGoalList
            refreshKey={refreshKey}
          />

        </div>

      </main>

    </div>
  );
}

export default SavingsGoals;