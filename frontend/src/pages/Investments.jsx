import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getInvestments,
  getInvestmentSummary,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} from "../services/investmentService";


function Investments() {
  const navigate = useNavigate();

  // ==========================================
  // DATA
  // ==========================================

  const [investments, setInvestments] = useState([]);

  const [summary, setSummary] = useState({
    total_invested: 0,
    current_value: 0,
    profit_loss: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");


  // ==========================================
  // ADD INVESTMENT
  // ==========================================

  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    investment_type: "",
    name: "",
    amount_invested: "",
    current_value: "",
    platform: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");


  // ==========================================
  // EDIT INVESTMENT
  // ==========================================

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const [editFormData, setEditFormData] = useState({
    investment_type: "",
    name: "",
    amount_invested: "",
    current_value: "",
    platform: "",
    notes: "",
  });

  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");


  // ==========================================
  // DELETE INVESTMENT
  // ==========================================

  const [deletingId, setDeletingId] = useState(null);


  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadInvestmentData = useCallback(async () => {
    try {
      setPageError("");

      const [investmentData, summaryData] = await Promise.all([
        getInvestments(),
        getInvestmentSummary(),
      ]);

      setInvestments(
        Array.isArray(investmentData) ? investmentData : []
      );

      setSummary({
        total_invested: Number(summaryData?.total_invested || 0),
        current_value: Number(summaryData?.current_value || 0),
        profit_loss: Number(summaryData?.profit_loss || 0),
      });
    } catch (error) {
      console.error("Unable to load investments:", error);

      setPageError(
        error?.response?.data?.detail ||
          "Unable to load investments."
      );
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    loadInvestmentData();
  }, [loadInvestmentData]);


  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };


  // ==========================================
  // ADD INPUT CHANGE
  // ==========================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // ADD INVESTMENT
  // ==========================================

  const handleAddInvestment = async (event) => {
    event.preventDefault();

    const investmentType = formData.investment_type.trim();
    const name = formData.name.trim();

    const amountInvested = Number(formData.amount_invested);
    const currentValue = Number(formData.current_value);

    const platform = formData.platform.trim();
    const notes = formData.notes.trim();

    if (!investmentType) {
      setFormError("Please select an investment type.");
      return;
    }

    if (!name) {
      setFormError("Please enter the investment name.");
      return;
    }

    if (!Number.isFinite(amountInvested) || amountInvested <= 0) {
      setFormError("Amount invested must be greater than 0.");
      return;
    }

    if (!Number.isFinite(currentValue) || currentValue < 0) {
      setFormError("Current value cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await createInvestment({
        investment_type: investmentType,
        name,
        amount_invested: amountInvested,
        current_value: currentValue,
        platform: platform || null,
        notes: notes || null,
      });

      setFormData({
        investment_type: "",
        name: "",
        amount_invested: "",
        current_value: "",
        platform: "",
        notes: "",
      });

      setShowAddModal(false);

      await loadInvestmentData();
    } catch (error) {
      console.error("Unable to create investment:", error);

      setFormError(
        error?.response?.data?.detail ||
          "Unable to add investment."
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ==========================================
  // EDIT INPUT
  // ==========================================

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEditModal = (investment) => {
    setSelectedInvestment(investment);

    setEditFormData({
      investment_type: investment.investment_type || "",
      name: investment.name || "",
      amount_invested: investment.amount_invested ?? "",
      current_value: investment.current_value ?? "",
      platform: investment.platform || "",
      notes: investment.notes || "",
    });

    setEditError("");
    setShowEditModal(true);
  };


  // ==========================================
  // UPDATE INVESTMENT
  // ==========================================

  const handleUpdateInvestment = async (event) => {
    event.preventDefault();

    if (!selectedInvestment) {
      return;
    }

    const investmentType =
      editFormData.investment_type.trim();

    const name = editFormData.name.trim();

    const amountInvested =
      Number(editFormData.amount_invested);

    const currentValue =
      Number(editFormData.current_value);

    const platform = editFormData.platform.trim();
    const notes = editFormData.notes.trim();

    if (!investmentType || !name) {
      setEditError(
        "Investment type and name are required."
      );
      return;
    }

    if (!Number.isFinite(amountInvested) || amountInvested <= 0) {
      setEditError("Amount invested must be greater than 0.");
      return;
    }

    if (!Number.isFinite(currentValue) || currentValue < 0) {
      setEditError("Current value cannot be negative.");
      return;
    }

    try {
      setEditSubmitting(true);
      setEditError("");

      await updateInvestment(
        selectedInvestment.id,
        {
          investment_type: investmentType,
          name,
          amount_invested: amountInvested,
          current_value: currentValue,
          platform: platform || null,
          notes: notes || null,
        }
      );

      setShowEditModal(false);
      setSelectedInvestment(null);

      await loadInvestmentData();
    } catch (error) {
      console.error("Unable to update investment:", error);

      setEditError(
        error?.response?.data?.detail ||
          "Unable to update investment."
      );
    } finally {
      setEditSubmitting(false);
    }
  };


  // ==========================================
  // DELETE INVESTMENT
  // ==========================================

  const handleDeleteInvestment = async (investment) => {
    const confirmed = window.confirm(
      `Delete "${investment.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(investment.id);

      await deleteInvestment(investment.id);

      await loadInvestmentData();
    } catch (error) {
      console.error("Unable to delete investment:", error);

      alert(
        error?.response?.data?.detail ||
          "Unable to delete investment."
      );
    } finally {
      setDeletingId(null);
    }
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    navigate("/login");
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Budget Buddy
            </h1>

            <p className="text-sm text-slate-500">
              Investment Management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>


      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* TITLE */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Investments
            </h2>

            <p className="mt-1 text-slate-500">
              Track your investments and portfolio performance.
            </p>
          </div>

          <button
            onClick={() => {
              setFormError("");
              setShowAddModal(true);
            }}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            + Add Investment
          </button>
        </div>


        {/* SUMMARY CARDS */}

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Invested
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatMoney(summary.total_invested)}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Value
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatMoney(summary.current_value)}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Profit / Loss
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                summary.profit_loss >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {summary.profit_loss >= 0 ? "+" : "-"}
              {formatMoney(Math.abs(summary.profit_loss))}
            </p>
          </div>
        </div>


        {/* ERROR */}

        {pageError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {pageError}
          </div>
        )}


        {/* INVESTMENT LIST */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">
              Your Investments
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading investments...
            </div>
          ) : investments.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold text-slate-700">
                No investments yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add your first investment to start tracking your portfolio.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {investments.map((investment) => {
                const profitLoss =
                  Number(investment.current_value) -
                  Number(investment.amount_invested);

                return (
                  <div
                    key={investment.id}
                    className="flex flex-col justify-between gap-5 px-6 py-5 lg:flex-row lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900">
                          {investment.name}
                        </h4>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {investment.investment_type}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {investment.platform || "No platform"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {investment.notes || "No notes"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {investment.date
                          ? new Date(
                              investment.date
                            ).toLocaleDateString("en-IN")
                          : "No date"}
                      </p>
                    </div>


                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-400">
                          Invested
                        </p>

                        <p className="font-bold text-slate-800">
                          {formatMoney(
                            investment.amount_invested
                          )}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-slate-400">
                          Current
                        </p>

                        <p className="font-bold text-slate-800">
                          {formatMoney(
                            investment.current_value
                          )}
                        </p>
                      </div>


                      <div>
                        <p className="text-xs text-slate-400">
                          P/L
                        </p>

                        <p
                          className={`font-bold ${
                            profitLoss >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {profitLoss >= 0 ? "+" : "-"}
                          {formatMoney(Math.abs(profitLoss))}
                        </p>
                      </div>


                      <button
                        onClick={() =>
                          openEditModal(investment)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteInvestment(investment)
                        }
                        disabled={
                          deletingId === investment.id
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === investment.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>


      {/* ADD MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Add Investment
              </h3>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddInvestment}
              className="mt-6 space-y-4"
            >
              <select
                name="investment_type"
                value={formData.investment_type}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="">
                  Select investment type
                </option>
                <option value="Mutual Fund">
                  Mutual Fund
                </option>
                <option value="Stocks">Stocks</option>
                <option value="Fixed Deposit">
                  Fixed Deposit
                </option>
                <option value="Gold">Gold</option>
                <option value="Crypto">Crypto</option>
                <option value="Other">Other</option>
              </select>

              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Investment name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                name="amount_invested"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount_invested}
                onChange={handleInputChange}
                placeholder="Amount invested"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                name="current_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.current_value}
                onChange={handleInputChange}
                placeholder="Current value"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                placeholder="Platform e.g. Groww, Zerodha"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notes"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3"
              />

              {formError && (
                <p className="text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  {submitting
                    ? "Adding..."
                    : "Add Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* EDIT MODAL */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Edit Investment
              </h3>

              <button
                onClick={() => setShowEditModal(false)}
                className="text-xl text-slate-400"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateInvestment}
              className="mt-6 space-y-4"
            >
              <select
                name="investment_type"
                value={editFormData.investment_type}
                onChange={handleEditInputChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="Mutual Fund">
                  Mutual Fund
                </option>
                <option value="Stocks">Stocks</option>
                <option value="Fixed Deposit">
                  Fixed Deposit
                </option>
                <option value="Gold">Gold</option>
                <option value="Crypto">Crypto</option>
                <option value="Other">Other</option>
              </select>

              <input
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                placeholder="Investment name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                name="amount_invested"
                type="number"
                step="0.01"
                value={editFormData.amount_invested}
                onChange={handleEditInputChange}
                placeholder="Amount invested"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                name="current_value"
                type="number"
                step="0.01"
                value={editFormData.current_value}
                onChange={handleEditInputChange}
                placeholder="Current value"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <input
                name="platform"
                value={editFormData.platform}
                onChange={handleEditInputChange}
                placeholder="Platform"
                className="w-full rounded-xl border border-slate-200 px-4 py-3"
              />

              <textarea
                name="notes"
                value={editFormData.notes}
                onChange={handleEditInputChange}
                placeholder="Notes"
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3"
              />

              {editError && (
                <p className="text-sm text-red-600">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50"
                >
                  {editSubmitting
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Investments;
