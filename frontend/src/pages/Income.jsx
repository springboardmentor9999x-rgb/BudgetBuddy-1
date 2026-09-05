import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiAlertCircle,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";

import api from "../services/api";

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Other",
];

const EMPTY_FORM = {
  source: "",
  amount: "",
  account_id: "",
  description: "",
  category: "",
};

function Income() {
  const navigate = useNavigate();

  const [incomes, setIncomes] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [totalIncome, setTotalIncome] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [errorMessage, setErrorMessage] = useState("");
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState(null);

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    loadIncomeData();
  }, []);

  const loadIncomeData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        incomeResponse,
        summaryResponse,
        accountsResponse,
      ] = await Promise.all([
        api.get("/income/"),
        api.get("/income/summary"),
        api.get("/accounts/"),
      ]);

      setIncomes(
        Array.isArray(incomeResponse.data)
          ? incomeResponse.data
          : []
      );

      setTotalIncome(
        Number(summaryResponse.data?.total_income || 0)
      );

      setAccounts(
        Array.isArray(accountsResponse.data)
          ? accountsResponse.data
          : []
      );
    } catch (error) {
      console.error("Error loading income:", error);

      const detail = error.response?.data?.detail;

      const message =
        typeof detail === "string"
          ? detail
          : "Unable to load income data.";

      setErrorMessage(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORM HANDLER
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setEditingIncome(null);
    setFormData(EMPTY_FORM);
    setErrorMessage("");
    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (income) => {
    setEditingIncome(income);

    setFormData({
      source: income.source || "",
      amount:
        income.amount !== null &&
        income.amount !== undefined
          ? income.amount.toString()
          : "",
      account_id:
        income.account_id !== null &&
        income.account_id !== undefined
          ? income.account_id.toString()
          : "",
      description: income.description || "",
      category: income.category || "",
    });

    setErrorMessage("");
    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingIncome(null);
    setFormData(EMPTY_FORM);
    setErrorMessage("");
  };

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    const source = formData.source.trim();
    const description = formData.description.trim();
    const amount = Number(formData.amount);

    if (!source) {
      return "Income source is required.";
    }

    if (
      !formData.amount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      return "Amount must be greater than 0.";
    }

    if (!formData.category) {
      return "Please select an income category.";
    }

    if (!INCOME_CATEGORIES.includes(formData.category)) {
      return "Please select a valid income category.";
    }

    if (!description) {
      return "Description is required.";
    }

    if (description.length > 500) {
      return "Description must not exceed 500 characters.";
    }

    if (
      formData.account_id &&
      Number(formData.account_id) <= 0
    ) {
      return "Please select a valid bank account.";
    }

    return null;
  };

  // ============================================================
  // CREATE / UPDATE INCOME
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        source: formData.source.trim(),
        amount: Number(formData.amount),
        account_id: formData.account_id
          ? Number(formData.account_id)
          : null,
        description: formData.description.trim(),
        category: formData.category,
      };

      if (editingIncome) {
        await api.put(
          `/income/${editingIncome.id}`,
          payload
        );

        toast.success("Income updated successfully.");
      } else {
        await api.post("/income/", payload);

        toast.success("Income added successfully.");
      }

      await loadIncomeData();

      setShowModal(false);
      setEditingIncome(null);
      setFormData(EMPTY_FORM);
      setErrorMessage("");
    } catch (error) {
      console.error("Income save error:", error);

      const detail = error.response?.data?.detail;

      let message;

      if (Array.isArray(detail)) {
        message =
          detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(", ") || "Validation failed.";
      } else if (typeof detail === "string") {
        message = detail;
      } else {
        message = editingIncome
          ? "Unable to update income."
          : "Unable to add income.";
      }

      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // DELETE INCOME
  // ============================================================


  // ============================================================
  // DELETE INCOME
  // ============================================================

  const handleDelete = (income) => {
    setIncomeToDelete(income);
  };

  const confirmDeleteIncome = async () => {
    if (!incomeToDelete) return;

    try {
      setDeletingIncomeId(incomeToDelete.id);
      setErrorMessage("");

      await api.delete(`/income/${incomeToDelete.id}`);

      setIncomeToDelete(null);

      toast.success("Income deleted successfully.");

      await loadIncomeData();
    } catch (error) {
      console.error("Income delete error:", error);

      const detail = error.response?.data?.detail;

      const message =
        typeof detail === "string"
          ? detail
          : "Unable to delete income.";

      setErrorMessage(message);
      toast.error(message);
      setIncomeToDelete(null);
    } finally {
      setDeletingIncomeId(null);
    }
  };

  // ============================================================
  // FORMAT CURRENCY
  // ============================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // ACCOUNT NAME
  // ============================================================

  const getAccountName = (accountId) => {
    if (!accountId) {
      return "No account";
    }

    const account = accounts.find(
      (item) => item.id === accountId
    );

    if (!account) {
      return "Unknown account";
    }

    return (
      account.account_name ||
      account.name ||
      account.bank_name ||
      `Account #${account.id}`
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading income...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6">

          {/* Back to Dashboard */}

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span>&lt;-</span> Back to Dashboard
          </button>

          {/* Page Header */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                Finance
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#071a2b]">
                Income
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage and track your income sources.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={loadIncomeData}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <FiRefreshCw />
                Refresh
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#071a2b] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#0b263b]"
              >
                <FiPlus />
                Add Income
              </button>

            </div>
          </div>
        </div>

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {errorMessage && !showModal && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />

            <span>{errorMessage}</span>
          </div>
        )}

        {/* ======================================================
            TOTAL INCOME
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiDollarSign className="text-2xl" />
            </div>

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Income
              </p>

              <p className="mt-1 text-2xl font-bold text-[#071a2b]">
                {formatCurrency(totalIncome)}
              </p>

            </div>
          </div>
        </div>

        {/* ======================================================
            INCOME TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-lg font-bold text-[#071a2b]">
              Income Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All income records belonging to your account.
            </p>

          </div>

          {incomes.length === 0 ? (

            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <FiDollarSign className="text-2xl" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No income records
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Add your first income record to start tracking your earnings.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#071a2b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b263b]"
              >
                <FiPlus />
                Add Income
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Source
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Account
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {incomes.map((income) => (

                    <tr
                      key={income.id}
                      className="transition hover:bg-slate-50/70"
                    >

                      <td className="whitespace-nowrap px-6 py-4">

                        <p className="font-semibold text-slate-800">
                          {income.source}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {income.category}
                        </span>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-bold text-emerald-600">
                        {formatCurrency(income.amount)}
                      </td>

                      <td className="max-w-xs px-6 py-4">

                        <p className="truncate text-sm text-slate-600">
                          {income.description}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {getAccountName(income.account_id)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {formatDate(income.date)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(income)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                            title="Edit income"
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(income)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            title="Delete income"
                          >
                            <FiTrash2 />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>
      </div>

      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-[#071a2b]">
                  {editingIncome
                    ? "Edit Income"
                    : "Add Income"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingIncome
                    ? "Update your income record."
                    : "Add a new income record."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <FiX className="text-xl" />
              </button>

            </div>

            {/* Modal Error */}

            {errorMessage && (

              <div className="mx-6 mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">

                <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />

                <span>{errorMessage}</span>

              </div>

            )}

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Source */}

              <div>

                <label
                  htmlFor="source"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Income Source
                </label>

                <input
                  id="source"
                  name="source"
                  type="text"
                  value={formData.source}
                  onChange={handleChange}
                  placeholder="e.g. Monthly Salary"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />

              </div>

              {/* Amount */}

              <div>

                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Amount
                </label>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 30000"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />

              </div>

              {/* Category */}

              <div>

                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                >

                  <option value="">
                    Select income category
                  </option>

                  {INCOME_CATEGORIES.map((category) => (

                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>

                  ))}

                </select>

              </div>

              {/* Account */}

              <div>

                <label
                  htmlFor="account_id"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Bank Account

                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <select
                  id="account_id"
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                >

                  <option value="">
                    No bank account
                  </option>

                  {accounts.map((account) => (

                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.account_name ||
                        account.name ||
                        account.bank_name ||
                        `Account #${account.id}`}
                    </option>

                  ))}

                </select>

              </div>

              {/* Description */}

              <div>

                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this income"
                  maxLength={500}
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                />

                <div className="mt-1 flex justify-between text-xs text-slate-400">

                  <span>
                    Description is required.
                  </span>

                  <span>
                    {formData.description.length}/500
                  </span>

                </div>

              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#071a2b] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b263b] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-emerald-400" />

                      {editingIncome
                        ? "Updating..."
                        : "Adding..."}
                    </>
                  ) : (
                    editingIncome
                      ? "Update Income"
                      : "Add Income"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ========================================================
          DELETE INCOME CONFIRMATION
      ======================================================== */}

      {incomeToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#071a2b]/60 p-4">

          <div
            className="absolute inset-0"
            onClick={() => {
              if (!deletingIncomeId) {
                setIncomeToDelete(null);
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
                  Delete Income?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this income?
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {incomeToDelete.category} {"\u2014"} {"\u20B9"}{Number(incomeToDelete.amount).toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  This action cannot be undone.
                </p>
              </div>

            </div>

            <div className="mt-7 flex gap-3">

              <button
                type="button"
                onClick={() => setIncomeToDelete(null)}
                disabled={deletingIncomeId !== null}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteIncome}
                disabled={deletingIncomeId !== null}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingIncomeId !== null ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Income;

