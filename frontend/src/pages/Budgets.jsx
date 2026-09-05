import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiPlus,
  FiPieChart,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService";

function Budgets() {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    limit: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);

  // ==========================================================
  // LOAD BUDGETS
  // ==========================================================

  const loadBudgets = async () => {
    try {
      setLoading(true);

      const data = await getBudgets();

      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load budgets:", error);

      const message =
        error?.response?.data?.detail ||
        "Unable to load budgets.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to load budgets."
      );

      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  // ==========================================================
  // OPEN ADD MODAL
  // ==========================================================

  const openAddModal = () => {
    setEditingBudget(null);

    setFormData({
      category: "",
      limit: "",
    });

    setShowModal(true);
  };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const openEditModal = (budget) => {
    setEditingBudget(budget);

    setFormData({
      category: budget.category || "",
      limit: budget.limit || "",
    });

    setShowModal(true);
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingBudget(null);

    setFormData({
      category: "",
      limit: "",
    });
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category.trim()) {
      toast.error("Please enter a category.");
      return;
    }

    if (!formData.limit || Number(formData.limit) <= 0) {
      toast.error("Please enter a valid budget limit.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        category: formData.category.trim(),
        limit: Number(formData.limit),
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, payload);
        toast.success("Budget updated successfully.");
      } else {
        await createBudget(payload);
        toast.success("Budget created successfully.");
      }

      closeModal();
      await loadBudgets();
    } catch (error) {
      console.error("Unable to save budget:", error);

      const message =
        error?.response?.data?.detail ||
        "Unable to save budget.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to save budget."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = (budget) => {
    setBudgetToDelete(budget);
  };

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return;

    try {
      setDeletingBudgetId(budgetToDelete.id);

      await deleteBudget(budgetToDelete.id);

      setBudgetToDelete(null);

      toast.success("Budget deleted successfully.");

      await loadBudgets();
    } catch (error) {
      console.error("Unable to delete budget:", error);

      const message =
        error?.response?.data?.detail ||
        "Unable to delete budget.";

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to delete budget."
      );
    } finally {
      setDeletingBudgetId(null);
    }
  };

  // ==========================================================
  // TOTAL
  // ==========================================================

  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.limit || 0),
    0
  );

  // ==========================================================
  // CURRENCY
  // ==========================================================

  const formatCurrency = (amount) => {
    return `\u20B9${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-[#0b2239]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex min-h-[84px] items-center justify-between border-b border-[#dfe6ee] bg-white px-8">

        <div className="flex items-center gap-5">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#dfe6ee] bg-white text-[#58708f] transition hover:bg-[#f5f8fb]"
          >
            <FiArrowLeft size={24} />
          </button>

          <div>
            <h1 className="text-[30px] font-bold leading-tight text-[#09233f]">
              Budgets
            </h1>

            <p className="mt-1 text-[16px] text-[#58708f]">
              Manage your spending limits and stay on track.
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={loadBudgets}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#dfe6ee] bg-white text-[#18344f] transition hover:bg-[#f5f8fb]"
          >
            <FiRefreshCw size={22} />
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="flex h-14 items-center gap-2 rounded-2xl bg-[#09233f] px-6 text-[17px] font-semibold text-white transition hover:bg-[#123452]"
          >
            <FiPlus size={21} />
            Add Budget
          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="px-8 py-14">

        {/* OVERVIEW */}

        <section>

          <p className="text-[17px] font-semibold uppercase tracking-wide text-[#00a878]">
            Budget Overview
          </p>

          <h2 className="mt-4 text-[38px] font-bold leading-tight text-[#09233f]">
            Your budgets
          </h2>

          <p className="mt-3 text-[20px] text-[#58708f]">
            Set limits for each spending category.
          </p>

        </section>

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <section className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* TOTAL BUDGET */}

          <div className="flex min-h-[156px] items-center rounded-[22px] border border-[#dfe6ee] bg-white px-8 shadow-[0_2px_5px_rgba(9,35,63,0.08)]">

            <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[#eef0ff] text-[#5965e8]">
              <FiPieChart size={34} />
            </div>

            <div className="ml-7">

              <p className="text-[19px] text-[#58708f]">
                Total Budget
              </p>

              <p className="mt-2 text-[36px] font-bold leading-none text-[#09233f]">
                {formatCurrency(totalBudget)}
              </p>

            </div>

          </div>

          {/* ACTIVE BUDGETS */}

          <div className="flex min-h-[156px] items-center rounded-[22px] border border-[#dfe6ee] bg-white px-8 shadow-[0_2px_5px_rgba(9,35,63,0.08)]">

            <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[#e7faf4] text-[#00b982]">
              <FiPieChart size={34} />
            </div>

            <div className="ml-7">

              <p className="text-[19px] text-[#58708f]">
                Active Budgets
              </p>

              <p className="mt-2 text-[36px] font-bold leading-none text-[#09233f]">
                {budgets.length}
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            BUDGET CATEGORIES
        =================================================== */}

        <section className="mt-16">

          <h2 className="text-[27px] font-bold text-[#09233f]">
            Your Budget Categories
          </h2>

          <p className="mt-2 text-[18px] text-[#58708f]">
            Set limits for each spending category.
          </p>

        </section>

        {/* ===================================================
            BUDGET CARDS
        =================================================== */}

        <section className="mt-7">

          {loading ? (

            <div className="rounded-[22px] border border-[#dfe6ee] bg-white p-8 text-[#58708f]">
              Loading budgets...
            </div>

          ) : budgets.length === 0 ? (

            <div className="rounded-[22px] border border-[#dfe6ee] bg-white p-8">

              <p className="text-[17px] font-medium text-[#58708f]">
                No budgets yet
              </p>

              <p className="mt-2 text-[#7a8da5]">
                Create your first budget to start tracking your spending.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              {budgets.map((budget) => (

                <div
                  key={budget.id}
                  className="rounded-[22px] border border-[#dfe6ee] bg-white p-7 shadow-[0_2px_5px_rgba(9,35,63,0.08)]"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-[17px] bg-[#eef0ff] text-[#5965e8]">
                        <FiPieChart size={26} />
                      </div>

                      <div>

                        <h3 className="text-[21px] font-bold text-[#09233f]">
                          {budget.category}
                        </h3>

                        <p className="mt-1 text-[15px] text-[#58708f]">
                          Spending limit
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <button
                        type="button"
                        onClick={() => openEditModal(budget)}
                        className="text-[#6d819a] transition hover:text-[#09233f]"
                      >
                        <FiEdit2 size={21} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(budget)}
                        className="text-[#6d819a] transition hover:text-red-500"
                      >
                        <FiTrash2 size={21} />
                      </button>

                    </div>

                  </div>

                  {/* LIMIT */}

                  <div className="mt-10">

                    <p className="text-[15px] font-medium uppercase tracking-wide text-[#71859d]">
                      Monthly Limit
                    </p>

                    <p className="mt-2 text-[34px] font-bold text-[#09233f]">
                      {formatCurrency(budget.limit)}
                    </p>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#e5e9ef]">
                    <div
                      className="h-full rounded-full bg-[#5965e8]"
                      style={{ width: "0%" }}
                    />
                  </div>

                  <p className="mt-3 text-[15px] text-[#71859d]">
                    Budget limit configured
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-[#09233f]">
                  {editingBudget ? "Edit Budget" : "Add Budget"}
                </h2>

                <p className="mt-1 text-sm text-[#58708f]">
                  Set your spending limit.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-[#71859d] hover:text-[#09233f]"
              >
                <FiX size={24} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium text-[#09233f]">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Food"
                  className="w-full rounded-xl border border-[#dfe6ee] px-4 py-3 text-[#09233f] outline-none focus:border-[#09233f]"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-[#09233f]">
                  Monthly Limit
                </label>

                <input
                  type="number"
                  name="limit"
                  value={formData.limit}
                  onChange={handleChange}
                  placeholder="e.g. 5000"
                  min="1"
                  step="0.01"
                  className="w-full rounded-xl border border-[#dfe6ee] px-4 py-3 text-[#09233f] outline-none focus:border-[#09233f]"
                />

              </div>

              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#dfe6ee] px-5 py-3 font-medium text-[#58708f]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#09233f] px-6 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingBudget
                    ? "Update Budget"
                    : "Add Budget"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ========================================================
          DELETE BUDGET CONFIRMATION
      ======================================================== */}

      {budgetToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#071a2b]/60 px-4">

          <div
            className="absolute inset-0"
            onClick={() => {
              if (!deletingBudgetId) {
                setBudgetToDelete(null);
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
                  Delete Budget?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this budget?
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {budgetToDelete.category} {"\u2014"} {"\u20B9"}{Number(budgetToDelete.limit || 0).toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  This action cannot be undone.
                </p>
              </div>

            </div>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={() => setBudgetToDelete(null)}
                disabled={deletingBudgetId !== null}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteBudget}
                disabled={deletingBudgetId !== null}
                className="flex flex-1 items-center justify-center rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingBudgetId !== null ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Budgets;

