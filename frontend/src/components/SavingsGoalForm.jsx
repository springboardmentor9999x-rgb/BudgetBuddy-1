import { useState } from "react";
import {
  FiTarget,
  FiCalendar,
  FiDollarSign,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../services/api";

function SavingsGoalForm({ onGoalCreated }) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a savings goal title.");
      return;
    }

    if (!targetAmount || Number(targetAmount) <= 0) {
      toast.error("Please enter a valid target amount.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        target_amount: Number(targetAmount),
        ...(targetDate ? { target_date: targetDate } : {}),
      };

      const response = await api.post("/savings-goals", payload);

      toast.success("Savings goal created successfully.");

      setTitle("");
      setTargetAmount("");
      setTargetDate("");

      if (onGoalCreated) {
        onGoalCreated(response.data);
      }
    } catch (error) {
      console.error("Unable to create savings goal:", error);

      const message =
        error?.response?.data?.detail ||
        "Unable to create savings goal.";

      toast.error(
        Array.isArray(message)
          ? "Please check the entered values."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FiTarget className="text-xl" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#071a2b]">
              Create Savings Goal
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Set a target and start saving towards it.
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          FORM FIELDS
      ========================================== */}

      <div className="space-y-5">

        {/* ========================================
            GOAL TITLE
        ======================================== */}

        <div>
          <label
            htmlFor="savings-goal-title"
            className="mb-2 block text-sm font-semibold text-[#071a2b]"
          >
            Goal Title
          </label>

          <div className="relative">
            <FiTarget className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              id="savings-goal-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. New Laptop"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[#071a2b] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* ========================================
            TARGET AMOUNT
        ======================================== */}

        <div>
          <label
            htmlFor="savings-goal-amount"
            className="mb-2 block text-sm font-semibold text-[#071a2b]"
          >
            Target Amount
          </label>

          <div className="relative">
            <FiDollarSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              id="savings-goal-amount"
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(event.target.value)
              }
              placeholder="10000"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[#071a2b] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* ========================================
            TARGET DATE
        ======================================== */}

        <div>
          <label
            htmlFor="savings-goal-date"
            className="mb-2 block text-sm font-semibold text-[#071a2b]"
          >
            Target Date

            <span className="ml-1 font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              id="savings-goal-date"
              type="date"
              value={targetDate}
              onChange={(event) =>
                setTargetDate(event.target.value)
              }
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[#071a2b] outline-none transition hover:border-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* ========================================
            SUBMIT BUTTON
        ======================================== */}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating...
            </>
          ) : (
            <>
              <FiCheck className="text-base" />
              Create Savings Goal
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default SavingsGoalForm;