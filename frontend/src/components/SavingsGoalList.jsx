import { useEffect, useState } from "react";
import {
  FiTarget,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../services/api";

function SavingsGoalList({ refreshKey = 0 }) {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [contributingId, setContributingId] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  // ==========================================
  // LOAD ACCOUNTS
  // ==========================================

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/accounts/");

      setAccounts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Unable to fetch bank accounts:",
        error
      );

      toast.error("Unable to load bank accounts.");
    }
  };

  // ==========================================
  // LOAD SAVINGS GOALS
  // ==========================================

  const fetchGoals = async () => {
    try {
      setLoading(true);

      const response = await api.get("/savings-goals");

      setGoals(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Unable to fetch savings goals:",
        error
      );

      const message =
        error?.response?.data?.detail ||
        "Unable to load savings goals.";

      toast.error(
        Array.isArray(message)
          ? "Unable to load savings goals."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchAccounts();
  }, [refreshKey]);

  // ==========================================
  // DELETE SAVINGS GOAL
  // ==========================================

  const handleDelete = (goal) => {
    setGoalToDelete(goal);
  };

  const confirmDeleteGoal = async () => {
    if (!goalToDelete) return;

    try {
      setDeletingId(goalToDelete.id);

      await api.delete(`/savings-goals/${goalToDelete.id}`);

      setGoals((currentGoals) =>
        currentGoals.filter(
          (goal) => goal.id !== goalToDelete.id
        )
      );

      setGoalToDelete(null);

      toast.success(
        "Savings goal deleted successfully."
      );
    } catch (error) {
      console.error(
        "Unable to delete savings goal:",
        error
      );

      const message =
        error?.response?.data?.detail ||
        "Unable to delete savings goal.";

      toast.error(
        Array.isArray(message)
          ? "Unable to delete savings goal."
          : message
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // ADD CONTRIBUTION
  // ==========================================

  const handleContribution = async (goal) => {
    const amount = Number(contributionAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(
        "Please enter a valid contribution amount."
      );
      return;
    }

    const currentAmount = Number(
      goal.current_amount || 0
    );

    const targetAmount = Number(
      goal.target_amount || 0
    );

    const remaining = Math.max(
      targetAmount - currentAmount,
      0
    );

    if (remaining <= 0) {
      toast.info(
        "This savings goal is already completed."
      );
      return;
    }

    if (amount > remaining) {
      toast.error(
        `Maximum contribution is ${formatCurrency(
          remaining
        )}.`
      );
      return;
    }

    try {
      setContributingId(goal.id);

      const response = await api.post(
        `/savings-goals/${goal.id}/contribute`,
        {
          amount,
          account_id: Number(selectedAccountId),
        }
      );

      setGoals((currentGoals) =>
        currentGoals.map((item) =>
          item.id === goal.id
            ? response.data
            : item
        )
      );

      setContributionAmount("");
      setContributingId(null);

      if (
        Number(response.data?.current_amount || 0) >=
        Number(response.data?.target_amount || 0)
      ) {
        toast.success(
          `Congratulations! You completed "${goal.title}".`
        );
      } else {
        toast.success(
          `${formatCurrency(amount)} added to "${goal.title}".`
        );
      }
    } catch (error) {
      console.error(
        "Unable to add contribution:",
        error
      );

      const detail = error?.response?.data?.detail;

      if (
        detail &&
        typeof detail === "object" &&
        detail.message === "Insufficient Balance"
      ) {
        toast.error(
          `Insufficient Balance. Available balance: ${formatCurrency(
            detail.available_balance
          )}`
        );
      } else {
        const message =
          detail ||
          "Unable to add contribution.";

        toast.error(
          Array.isArray(message)
            ? "Unable to add contribution."
            : message
        );
      }
    } finally {
      setContributingId(null);
    }
  };

  // ==========================================
  // CONTRIBUTE TO SAVINGS GOAL
  // ==========================================

  const handleContribute = async (goalId) => {
    const amount = Number(contributionAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid contribution amount.");
      return;
    }

    if (!selectedAccountId) {
      toast.error("Please select a bank account.");
      return;
    }

    try {
      setContributingId(goalId);

      const response = await api.post(
        `/savings-goals/${goalId}/contribute`,
        {
          amount,
          account_id: Number(selectedAccountId),
        }
      );

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === goalId ? response.data : goal
        )
      );

      setContributionAmount("");

      toast.success("Contribution added successfully.");
    } catch (error) {
      console.error(
        "Unable to contribute to savings goal:",
        error
      );

      const detail = error?.response?.data?.detail;

      if (
        detail &&
        typeof detail === "object" &&
        detail.message === "Insufficient Balance"
      ) {
        toast.error(
          `Insufficient Balance. Available balance: ${formatCurrency(
            detail.available_balance
          )}`
        );
      } else {
        const message =
          detail ||
          "Unable to add contribution.";

        toast.error(
          Array.isArray(message)
            ? "Unable to add contribution."
            : message
        );
      }
    } finally {
      setContributingId(null);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================

  const formatCurrency = (value) => {
    return `\u20B9${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "No target date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No target date";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getProgress = (
    currentAmount,
    targetAmount
  ) => {
    const current = Number(
      currentAmount || 0
    );

    const target = Number(
      targetAmount || 0
    );

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      Math.max((current / target) * 100, 0),
      100
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

          <span className="text-sm text-slate-500">
            Loading savings goals...
          </span>
        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div>
          <h3 className="text-xl font-bold text-[#071a2b]">
            Savings Goals
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Track your progress towards your
            financial goals.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <FiTarget className="text-xl" />
        </div>

      </div>

      {/* EMPTY STATE */}

      {goals.length === 0 ? (

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
            <FiTarget className="text-2xl" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-600">
            No savings goals yet
          </p>

          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
            Create your first goal to start
            tracking your savings progress.
          </p>

        </div>

      ) : (

        <div className="mt-6 space-y-4">

          {goals.map((goal) => {

            const progress = getProgress(
              goal.current_amount,
              goal.target_amount
            );

            const isCompleted =
              goal.status === "completed" ||
              progress >= 100;

            const remainingAmount = Math.max(
              Number(goal.target_amount || 0) -
                Number(goal.current_amount || 0),
              0
            );

            const isContributing =
              contributingId === goal.id;

            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-emerald-100 hover:bg-white hover:shadow-sm"
              >

                {/* GOAL HEADER */}

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <h4 className="truncate text-sm font-bold text-[#071a2b]">
                        {goal.title}
                      </h4>

                      {isCompleted ? (
                        <FiCheckCircle className="shrink-0 text-emerald-500" />
                      ) : (
                        <FiClock className="shrink-0 text-slate-400" />
                      )}

                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {isCompleted
                        ? "Goal completed"
                        : "Goal in progress"}
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-2">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {Math.round(progress)}%
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(goal)
                      }
                      disabled={
                        deletingId === goal.id
                      }
                      title="Delete savings goal"
                      aria-label={`Delete ${goal.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiTrash2
                        className={
                          deletingId === goal.id
                            ? "animate-pulse"
                            : ""
                        }
                      />
                    </button>

                  </div>

                </div>

                {/* PROGRESS */}

                <div className="mt-5">

                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">

                    <span className="font-bold text-slate-700">
                      {formatCurrency(
                        goal.current_amount
                      )}
                    </span>

                    <span className="text-slate-400">
                      of{" "}
                      {formatCurrency(
                        goal.target_amount
                      )}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

                {/* REMAINING */}

                {!isCompleted && (
                  <div className="mt-3 flex items-center justify-between">

                    <span className="text-xs text-slate-400">
                      Remaining
                    </span>

                    <span className="text-xs font-bold text-slate-600">
                      {formatCurrency(
                        remainingAmount
                      )}
                    </span>

                  </div>
                )}

                {/* CONTRIBUTION */}

                {!isCompleted && (
                  <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3">

                    <div className="flex items-center justify-between gap-3">

                      <div className="flex items-center gap-2">
                        <FiPlus className="text-emerald-600" />

                        <span className="text-xs font-bold text-slate-700">
                          Add Contribution
                        </span>
                      </div>

                      {contributingId === goal.id && (
                        <FiRefreshCw className="animate-spin text-emerald-500" />
                      )}

                    </div>

                    {/* FROM BANK */}

                    <div className="mt-3">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        From Bank
                      </label>

                      <select
                        value={selectedAccountId}
                        onChange={(event) =>
                          setSelectedAccountId(
                            event.target.value
                          )
                        }
                        disabled={isContributing}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          Select Bank
                        </option>

                        {accounts.map((account) => (
                          <option
                            key={account.id}
                            value={account.id}
                          >
                            {account.bank_name} ****{" "}
                            {String(
                              account.account_number
                            ).slice(-4)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* AMOUNT + BUTTON */}

                    <div className="mt-3 flex gap-2">

                      <div className="relative flex-1">

                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                          {"\u20B9"}
                        </span>

                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={
                            contributingId === goal.id
                              ? contributionAmount
                              : contributionAmount
                          }
                          onChange={(event) =>
                            setContributionAmount(
                              event.target.value
                            )
                          }
                          placeholder="Enter amount"
                          disabled={isContributing}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleContribution(goal)
                        }
                        disabled={
                          isContributing ||
                          !contributionAmount
                        }
                        className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isContributing
                          ? "Adding..."
                          : "Add"}
                      </button>

                      {contributionAmount && (
                        <button
                          type="button"
                          onClick={() =>
                            setContributionAmount("")
                          }
                          disabled={isContributing}
                          title="Clear amount"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiX />
                        </button>
                      )}

                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      Remaining:{" "}
                      {formatCurrency(
                        remainingAmount
                      )}
                    </p>

                  </div>
                )}

                {/* TARGET DATE */}

                <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400">

                  <FiCalendar className="shrink-0" />

                  <span>
                    {goal.target_date
                      ? `Target date: ${formatDate(
                          goal.target_date
                        )}`
                      : "No target date"}
                  </span>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* REFRESH */}

      {goals.length > 0 && (
        <button
          type="button"
          onClick={fetchGoals}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh Goals
        </button>
      )}

      {/* ========================================================
          DELETE SAVINGS GOAL CONFIRMATION
      ======================================================== */}

      {goalToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#071a2b]/60 px-4">

          <div
            className="absolute inset-0"
            onClick={() => {
              if (!deletingId) {
                setGoalToDelete(null);
              }
            }}
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
                <FiTrash2 />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#071a2b]">
                  Delete Savings Goal?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this savings goal?
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {goalToDelete.title}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  This action cannot be undone.
                </p>
              </div>

            </div>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
                disabled={deletingId !== null}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteGoal}
                disabled={deletingId !== null}
                className="flex flex-1 items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId !== null ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}

export default SavingsGoalList;





