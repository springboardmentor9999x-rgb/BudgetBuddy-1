import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiTrendingDown,
  FiPlus,
  FiX,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

import { getAccounts } from "../services/accounts";

const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Education",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Transportation",
  "Rent",
  "Groceries",
  "Other",
];

const PAYMENT_METHODS = [
  "UPI",
  "Debit Card",
  "Credit Card",
  "Net Banking",
  "Cash",
  "Other",
];

function Expenses() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);

  const [summary, setSummary] = useState({
    total_expense: 0,
    categories: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    account_id: "",
    payment_method: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const [editFormData, setEditFormData] = useState({
    category: "",
    amount: "",
    account_id: "",
    payment_method: "",
    description: "",
  });

  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // ==========================================================
  // LOAD EXPENSE DATA
  // ==========================================================

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      setError("");

      const [expenseData, summaryData] = await Promise.all([
        getExpenses(),
        getExpenseSummary(),
      ]);

      const safeExpenses = Array.isArray(expenseData)
        ? expenseData
        : [];

      const sortedExpenses = [...safeExpenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setExpenses(sortedExpenses);

      setSummary({
        total_expense: Number(summaryData?.total_expense || 0),
        categories: Array.isArray(summaryData?.categories)
          ? summaryData.categories
          : [],
      });
    } catch (err) {
      console.error("Unable to load expenses:", err);

      const message =
        err?.response?.data?.detail ||
        "Unable to load your expenses. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to load your expenses. Please try again."
      );

      toast.error(
        typeof message === "string"
          ? message
          : "Unable to load your expenses."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD ACCOUNTS
  // ==========================================================

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);

      const data = await getAccounts();

      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Unable to load accounts:", err);

      setAccounts([]);

      toast.error("Unable to load bank accounts.");
    } finally {
      setAccountsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadExpenseData();
    loadAccounts();
  }, []);

  // ==========================================================
  // FIND ACCOUNT
  // ==========================================================

  const findAccount = (accountId) => {
    if (!accountId) {
      return null;
    }

    return accounts.find(
      (account) => Number(account.id) === Number(accountId)
    );
  };

  const formatAccount = (account) => {
    if (!account) {
      return "No bank account";
    }

    const lastFour = String(
      account.account_number || ""
    ).slice(-4);

    return `${account.bank_name} \u2022\u2022\u2022\u2022 ${lastFour}`;
  };

  // ==========================================================
  // ADD INPUT
  // ==========================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  // ==========================================================
  // CREATE EXPENSE
  // ==========================================================

  const handleAddExpense = async (event) => {
    event.preventDefault();

    setFormError("");

    const category = formData.category.trim();
    const amount = Number(formData.amount);

    const accountId = formData.account_id
      ? Number(formData.account_id)
      : null;

    const paymentMethod =
      formData.payment_method.trim() || null;

    const description =
      formData.description.trim();

    if (!category) {
      const message = "Please select an expense category.";

      setFormError(message);
      toast.error(message);
      return;
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      const message = "Please select a valid expense category.";

      setFormError(message);
      toast.error(message);
      return;
    }

    if (!amount || amount <= 0) {
      const message = "Please enter a valid amount.";

      setFormError(message);
      toast.error(message);
      return;
    }

    if (!description) {
      const message = "Description is required.";

      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      setSubmitting(true);

      await createExpense({
        category,
        amount,
        account_id: accountId,
        payment_method: paymentMethod,
        description,
      });

      toast.success("Expense added successfully.");

      setFormData({
        category: "",
        amount: "",
        account_id: "",
        payment_method: "",
        description: "",
      });

      setShowAddModal(false);

      await loadExpenseData();
    } catch (err) {
      console.error("Unable to create expense:", err);

      const detail = err?.response?.data?.detail;

      let message = "Unable to add expense. Please try again.";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message =
          detail
            .map((item) => item?.msg)
            .filter(Boolean)
            .join(", ") || message;
      }

      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const openEditModal = (expense) => {
    setSelectedExpense(expense);

    setEditFormData({
      category: EXPENSE_CATEGORIES.includes(expense.category)
        ? expense.category
        : "Other",

      amount: expense.amount || "",

      account_id: expense.account_id || "",

      payment_method:
        expense.payment_method || "",

      description: expense.description || "",
    });

    setEditError("");
    setShowEditModal(true);
  };

  // ==========================================================
  // EDIT INPUT
  // ==========================================================

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setEditError("");
  };

  // ==========================================================
  // UPDATE EXPENSE
  // ==========================================================

  const handleUpdateExpense = async (event) => {
    event.preventDefault();

    if (!selectedExpense) {
      return;
    }

    setEditError("");

    const category =
      editFormData.category.trim();

    const amount =
      Number(editFormData.amount);

    const accountId = editFormData.account_id
      ? Number(editFormData.account_id)
      : null;

    const paymentMethod =
      editFormData.payment_method.trim() || null;

    const description =
      editFormData.description.trim();

    if (!category) {
      const message = "Please select a category.";

      setEditError(message);
      toast.error(message);
      return;
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      const message = "Please select a valid category.";

      setEditError(message);
      toast.error(message);
      return;
    }

    if (!amount || amount <= 0) {
      const message = "Please enter a valid amount.";

      setEditError(message);
      toast.error(message);
      return;
    }

    if (!description) {
      const message = "Description is required.";

      setEditError(message);
      toast.error(message);
      return;
    }

    try {
      setUpdating(true);

      await updateExpense(
        selectedExpense.id,
        {
          category,
          amount,
          account_id: accountId,
          payment_method: paymentMethod,
          description,
        }
      );

      toast.success("Expense updated successfully.");

      setShowEditModal(false);
      setSelectedExpense(null);

      await loadExpenseData();
    } catch (err) {
      console.error("Unable to update expense:", err);

      const detail = err?.response?.data?.detail;

      let message =
        "Unable to update expense. Please try again.";

      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail)) {
        message =
          detail
            .map((item) => item?.msg)
            .filter(Boolean)
            .join(", ") || message;
      }

      setEditError(message);
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================================
  // DELETE EXPENSE
  // ==========================================================

  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      setDeletingId(expenseToDelete.id);
      setError("");

      await deleteExpense(expenseToDelete.id);

      setExpenseToDelete(null);

      toast.success("Expense deleted successfully.");

      await loadExpenseData();
    } catch (err) {
      console.error("Unable to delete expense:", err);

      const detail = err?.response?.data?.detail;

      const message =
        typeof detail === "string"
          ? detail
          : "Unable to delete expense. Please try again.";

      setError(message);
      toast.error(message);
      setExpenseToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // CLOSE ADD MODAL
  // ==========================================================

  const closeAddModal = () => {
    if (submitting) {
      return;
    }

    setShowAddModal(false);
    setFormError("");

    setFormData({
      category: "",
      amount: "",
      account_id: "",
      payment_method: "",
      description: "",
    });
  };

  // ==========================================================
  // CLOSE EDIT MODAL
  // ==========================================================

  const closeEditModal = () => {
    if (updating) {
      return;
    }

    setShowEditModal(false);
    setSelectedExpense(null);
    setEditError("");
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
              title="Back to Dashboard"
            >
              <FiArrowLeft />
            </button>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#071a2b]">
                Expenses
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Track and understand your spending
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={loadExpenseData}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
            >
              <FiRefreshCw
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError("");
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#071a2b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d2a43]"
            >
              <FiPlus />
              Add Expense
            </button>

          </div>

        </div>
      </header>

      {/* MAIN */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-semibold text-emerald-600">
            EXPENSE OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#071a2b]">
            Your spending
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Monitor where your money is going.
          </p>
        </motion.div>

        {/* LOADING */}

        {loading && (
          <div className="mt-10 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />

            <p className="text-sm text-slate-500">
              Loading expenses...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* CONTENT */}

        {!loading && (
          <>

            {/* TOTAL */}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Expenses
                  </p>

                  <p className="mt-2 text-4xl font-bold tracking-tight text-[#071a2b]">
                    {"\u20B9"}
                    {Number(
                      summary.total_expense || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">
                  <FiTrendingDown />
                </div>

              </div>
            </motion.div>

            {/* CATEGORY BREAKDOWN */}

            <section className="mt-8">

              <h3 className="text-lg font-bold text-[#071a2b]">
                Expense Breakdown by Category
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Category-wise breakdown of your expenses.
              </p>

              {summary.categories.length === 0 ? (

                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    No expense categories yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Add an expense to see your spending breakdown.
                  </p>
                </div>

              ) : (

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {summary.categories.map((item) => (

                    <motion.div
                      key={item.category}
                      whileHover={{ y: -3 }}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-sm font-medium text-slate-500">
                        {item.category}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-[#071a2b]">
                        {"\u20B9"}
                        {Number(
                          item.amount
                        ).toLocaleString("en-IN")}
                      </p>
                    </motion.div>

                  ))}

                </div>

              )}

            </section>

            {/* RECENT EXPENSES */}

            <section className="mt-10">

              <h3 className="text-lg font-bold text-[#071a2b]">
                Recent Expenses
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your latest expense transactions.
              </p>

              {expenses.length === 0 ? (

                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    No expenses yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Your expenses will appear here.
                  </p>
                </div>

              ) : (

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  {expenses.map((expense) => {

                    const account = findAccount(
                      expense.account_id
                    );

                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between border-b border-slate-100 px-6 py-5 last:border-b-0"
                      >

                        <div className="min-w-0">

                          <p className="font-semibold text-[#071a2b]">
                            {expense.category}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {expense.description}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">

                            {expense.account_id
                              ? formatAccount(account)
                              : "No bank account"}

                            {expense.payment_method
                              ? ` \u2022 ${expense.payment_method}`
                              : ""}

                          </p>

                        </div>

                        <div className="flex items-center gap-4">

                          <div className="text-right">

                            <p className="font-bold text-red-500">
                              -{"\u20B9"}
                              {Number(
                                expense.amount
                              ).toLocaleString("en-IN")}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                expense.date
                              ).toLocaleDateString("en-IN")}
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(expense)
                            }
                            disabled={
                              deletingId === expense.id
                            }
                            title="Edit expense"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteExpense(expense)
                            }
                            disabled={
                              deletingId === expense.id
                            }
                            title="Delete expense"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === expense.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>

                        </div>


                      </div>
                    );
                  })}

                </div>

              )}

            </section>

          </>
        )}

      </main>

      {/* ======================================================
          ADD EXPENSE MODAL
      ====================================================== */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-6">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  New transaction
                </p>

                <h3 className="mt-2 text-2xl font-bold text-[#071a2b]">
                  Add Expense
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Record a new expense in Budget Buddy.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={submitting}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FiX />
              </button>

            </div>

            <form
              onSubmit={handleAddExpense}
              className="mt-6 space-y-5"
            >

              {/* CATEGORY */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Category *
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={submitting}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select expense category
                  </option>

                  {EXPENSE_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* AMOUNT */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Amount *
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                    ?
                  </span>

                  <input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0.01"
                    step="0.01"
                    required
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>

              </div>

              {/* BANK ACCOUNT */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Bank Account

                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <select
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleInputChange}
                  disabled={
                    submitting ||
                    accountsLoading
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    {accountsLoading
                      ? "Loading accounts..."
                      : accounts.length === 0
                      ? "No bank accounts found"
                      : "Select bank account (optional)"}
                  </option>

                  {accounts.map(
                    (account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {formatAccount(account)}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PAYMENT METHOD */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Payment Method

                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  disabled={submitting}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select payment method
                  </option>

                  {PAYMENT_METHODS.map(
                    (method) => (
                      <option
                        key={method}
                        value={method}
                      >
                        {method}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Description *
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Dinner with friends"
                  rows={3}
                  maxLength={500}
                  required
                  disabled={submitting}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Description is required.
                </p>

              </div>

              {formError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#071a2b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2a43] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Add Expense
                    </>
                  )}

                </button>

              </div>

            </form>

          </motion.div>

        </div>

      )}

      {/* ======================================================
          EDIT EXPENSE MODAL
      ====================================================== */}

      {showEditModal && selectedExpense && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-6">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Update transaction
                </p>

                <h3 className="mt-2 text-2xl font-bold text-[#071a2b]">
                  Edit Expense
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update this expense transaction.
                </p>

              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={updating}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <FiX />
              </button>

            </div>

            <form
              onSubmit={handleUpdateExpense}
              className="mt-6 space-y-5"
            >

              {/* CATEGORY */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Category *
                </label>

                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditInputChange}
                  disabled={updating}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select expense category
                  </option>

                  {EXPENSE_CATEGORIES.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* AMOUNT */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Amount *
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                    ?
                  </span>

                  <input
                    name="amount"
                    type="number"
                    value={editFormData.amount}
                    onChange={handleEditInputChange}
                    min="0.01"
                    step="0.01"
                    required
                    disabled={updating}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                </div>

              </div>

              {/* BANK ACCOUNT */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Bank Account

                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <select
                  name="account_id"
                  value={editFormData.account_id}
                  onChange={handleEditInputChange}
                  disabled={
                    updating ||
                    accountsLoading
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select bank account (optional)
                  </option>

                  {accounts.map(
                    (account) => (
                      <option
                        key={account.id}
                        value={account.id}
                      >
                        {formatAccount(account)}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* PAYMENT METHOD */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Payment Method

                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <select
                  name="payment_method"
                  value={editFormData.payment_method}
                  onChange={handleEditInputChange}
                  disabled={updating}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                >

                  <option value="">
                    Select payment method
                  </option>

                  {PAYMENT_METHODS.map(
                    (method) => (
                      <option
                        key={method}
                        value={method}
                      >
                        {method}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="text-sm font-semibold text-slate-700">
                  Description *
                </label>

                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Dinner with friends"
                  rows={3}
                  maxLength={500}
                  required
                  disabled={updating}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {editError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#071a2b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0d2a43] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {updating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiEdit2 />
                      Update Expense
                    </>
                  )}

                </button>

              </div>

            </form>

          </motion.div>

        </div>

      )}

      {/* ==========================================
          DELETE EXPENSE CONFIRMATION
      ========================================== */}

      <AnimatePresence>
        {expenseToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!deletingId) setExpenseToDelete(null);
              }}
              className="absolute inset-0 bg-[#071a2b]/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
            >

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
                  <FiTrash2 />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#071a2b]">
                    Delete Expense?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Are you sure you want to delete this expense?
                  </p>

                  {expenseToDelete && (
                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {expenseToDelete.category} {"\u2014"} {"\u20B9"}{Number(expenseToDelete.amount).toLocaleString("en-IN")}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    This action cannot be undone.
                  </p>
                </div>

              </div>

              <div className="mt-7 flex gap-3">

                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  disabled={deletingId !== null}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteExpense}
                  disabled={deletingId !== null}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                >
                  {deletingId !== null ? "Deleting..." : "Delete"}
                </button>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Expenses;
