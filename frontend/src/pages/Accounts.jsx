import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCreditCard,
} from "react-icons/fi";

import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../services/accounts";


const BANK_OPTIONS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Indian Bank",
  "IDBI Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Federal Bank",
  "Karur Vysya Bank",
  "Bank of India",
  "Other",
];
const emptyForm = {
  bank_name: "",
  custom_bank_name: "",
  account_holder_name: "",
  account_number: "",
  account_type: "Savings",
  description: "",
};


function Accounts() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [notification, setNotification] = useState(null);


  // ==========================================
  // NOTIFICATION
  // ==========================================

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };


  // ==========================================
  // LOAD ACCOUNTS
  // ==========================================

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const data = await getAccounts();

      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      showNotification(
        "Unable to load bank accounts",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAccounts();
  }, []);


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // OPEN ADD MODAL
  // ==========================================

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData(emptyForm);
    setShowModal(true);
  };


  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (account) => {
    setEditingAccount(account);

    const isKnownBank = BANK_OPTIONS
      .filter((bank) => bank !== "Other")
      .includes(account.bank_name);

    setFormData({
      bank_name: isKnownBank ? account.bank_name : "Other",
      custom_bank_name: isKnownBank ? "" : account.bank_name || "",
      account_holder_name:
        account.account_holder_name || "",
      account_number: account.account_number || "",
      account_type: account.account_type || "Savings",
      description: account.description || "",
    });

    setShowModal(true);
  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingAccount(null);
    setFormData(emptyForm);
  };


  // ==========================================
  // SAVE ACCOUNT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const finalBankName =
      formData.bank_name === "Other"
        ? formData.custom_bank_name.trim()
        : formData.bank_name.trim();

    if (
      !finalBankName ||
      !formData.account_holder_name.trim() ||
      !formData.account_number.trim() ||
      !formData.account_type.trim()
    ) {
      showNotification(
        formData.bank_name === "Other" && !formData.custom_bank_name.trim()
          ? "Please enter your bank name"
          : "Please fill all required fields",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      const accountData = {
        ...formData,
        bank_name: finalBankName,
      };

      delete accountData.custom_bank_name;

      if (editingAccount) {
        await updateAccount(
          editingAccount.id,
          accountData
        );

        showNotification(
          "Bank account updated successfully"
        );
      } else {
        await createAccount(accountData);

        showNotification(
          "Bank account added successfully"
        );
      }

      setShowModal(false);
      setEditingAccount(null);
      setFormData(emptyForm);

      await loadAccounts();
    } catch (error) {
      console.error(error);

      const detail = error?.response?.data?.detail;

      const message =
        typeof detail === "object" && detail !== null
          ? detail.message || "Unable to save bank account"
          : detail || "Unable to save bank account";

      showNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDelete = (account) => {
    setAccountToDelete(account);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      setDeletingId(accountToDelete.id);

      await deleteAccount(accountToDelete.id);

      setAccounts((previous) =>
        previous.filter(
          (item) => item.id !== accountToDelete.id
        )
      );

      setAccountToDelete(null);

      showNotification(
        "Bank account deleted successfully"
      );
    } catch (error) {
      console.error(error);

      const message =
        error?.response?.data?.detail ||
        "Unable to delete bank account";

      setAccountToDelete(null);
      showNotification(message, "error");
    } finally {
      setDeletingId(null);
    }
  };


  // ==========================================
  // MASK ACCOUNT NUMBER
  // ==========================================

  const maskAccountNumber = (number) => {
    const value = String(number || "");

    if (!value) return "••••";

    return `•••• ${value.slice(-4)}`;
  };


  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================
          NOTIFICATION
      ====================================== */}

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed right-6 top-6 z-[100] rounded-2xl px-5 py-4 text-sm font-semibold shadow-xl ${
              notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>


      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <FiArrowLeft />
            </button>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#071a2b]">
                My Accounts
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Manage your registered bank accounts
              </p>
            </div>

          </div>


          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-[#071a2b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <FiPlus />
            Add Account
          </button>

        </div>
      </header>


      {/* ======================================
          CONTENT
      ====================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Registered Accounts
          </p>

          <p className="mt-1 text-3xl font-bold text-[#071a2b]">
            {loading ? "..." : accounts.length}
          </p>
        </div>


        {/* LOADING */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#071a2b]" />

            <p className="mt-4 text-sm text-slate-500">
              Loading your accounts...
            </p>
          </div>
        )}


        {/* EMPTY STATE */}

        {!loading && accounts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-600">
              <FiCreditCard />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#071a2b]">
              No bank accounts found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Register your first bank account to use it
              while adding income and expenses.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#071a2b] px-5 py-3 text-sm font-semibold text-white"
            >
              <FiPlus />
              Add Bank Account
            </button>

          </div>
        )}


        {/* ACCOUNT CARDS */}

        {!loading && accounts.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {accounts.map((account) => (
              <motion.div
                key={account.id}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-3xl bg-[#071a2b] p-6 text-white shadow-lg"
              >

                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/5" />

                <div className="relative">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        {account.account_type} Account
                      </p>

                      <h2 className="mt-2 text-xl font-bold">
                        {account.bank_name}
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                      <FiCreditCard />
                    </div>

                  </div>


                  <p className="mt-8 text-xl font-semibold tracking-[0.18em]">
                    {maskAccountNumber(
                      account.account_number
                    )}
                  </p>


                  <div className="mt-7">

                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Account Holder
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {account.account_holder_name}
                    </p>

                  </div>


                  {/* AVAILABLE BALANCE */}

                  <div className="mt-5">

                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Available Balance
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      ₹
                      {Number(
                        account.available_balance || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>


                  {account.description && (
                    <p className="mt-4 text-xs leading-5 text-slate-300">
                      {account.description}
                    </p>
                  )}


                  <div className="mt-6 flex gap-2 border-t border-white/10 pt-5">

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(account)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold transition hover:bg-white/20"
                    >
                      <FiEdit2 />
                      Edit
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(account)
                      }
                      disabled={
                        deletingId === account.id
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/25 disabled:opacity-50"
                    >
                      <FiTrash2 />

                      {deletingId === account.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>

                </div>

              </motion.div>
            ))}

          </div>
        )}

      </main>


      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#071a2b]/60 backdrop-blur-sm"
            />


            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"
            >

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                    Accounts
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-[#071a2b]">
                    {editingAccount
                      ? "Edit Bank Account"
                      : "Add Bank Account"}
                  </h2>
                </div>


                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                >
                  <FiX />
                </button>

              </div>


              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >

                {/* BANK NAME */}

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Bank Name *
                  </label>

                  <select
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                  >
                    <option value="">
                      Select your bank
                    </option>

                    {BANK_OPTIONS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>

                  {formData.bank_name === "Other" && (
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-slate-700">
                        Enter Bank Name *
                      </label>

                      <input
                        type="text"
                        name="custom_bank_name"
                        value={formData.custom_bank_name}
                        onChange={handleChange}
                        placeholder="Enter your bank name"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                      />
                    </div>
                  )}

                </div>


                {/* ACCOUNT HOLDER */}

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Account Holder Name *
                  </label>

                  <input
                    type="text"
                    name="account_holder_name"
                    value={
                      formData.account_holder_name
                    }
                    onChange={handleChange}
                    placeholder="Account holder name"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                </div>


                {/* ACCOUNT NUMBER */}

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Account Number *
                  </label>

                  <input
                    type="text"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    autoComplete="off"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                </div>


                {/* ACCOUNT TYPE */}

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Account Type *
                  </label>

                  <select
                    name="account_type"
                    value={formData.account_type}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-emerald-500"
                  >
                    <option value="Savings">
                      Savings
                    </option>

                    <option value="Current">
                      Current
                    </option>

                    <option value="Salary">
                      Salary
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>


                {/* DESCRIPTION */}

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Example: My primary salary account"
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500"
                  />
                </div>


                {/* BUTTONS */}

                <div className="flex gap-3 pt-3">

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-[#071a2b] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingAccount
                      ? "Update Account"
                      : "Add Account"}
                  </button>

                </div>

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          DELETE ACCOUNT CONFIRMATION
      ========================================== */}

      <AnimatePresence>
        {accountToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
                  <FiTrash2 />
                </div>

                <div className="min-w-0">

                  <h3 className="text-lg font-bold text-[#071a2b]">
                    Delete Bank Account?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Are you sure you want to delete your{" "}
                    <span className="font-semibold text-slate-700">
                      {accountToDelete.bank_name}
                    </span>{" "}
                    account ending in{" "}
                    <span className="font-semibold text-slate-700">
                      {String(accountToDelete.account_number || "").slice(-4)}
                    </span>?
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    This action cannot be undone.
                  </p>

                </div>

              </div>

              <div className="mt-6 flex gap-3">

                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  disabled={deletingId === accountToDelete.id}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteAccount}
                  disabled={deletingId === accountToDelete.id}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === accountToDelete.id
                    ? "Deleting..."
                    : "Delete Account"}
                </button>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


export default Accounts;





