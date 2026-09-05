import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import SavingsGoals from "./pages/SavingsGoals";
import Reports from "./pages/Reports";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminUsers from "./pages/AdminUsers";
import AdminPremiumUsers from "./pages/AdminPremiumUsers";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";

import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Security from "./pages/Security";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==============================
            AUTH
        ============================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        {/* ==============================
            PROTECTED APPLICATION
        ============================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Accounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/income"
          element={
            <ProtectedRoute>
              <Income />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            BUDGETS
        ============================== */}

        <Route
          path="/budgets"
          element={
            <ProtectedRoute>
              <Budgets />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            SAVINGS GOALS
        ============================== */}

        <Route
          path="/savings-goals"
          element={
            <ProtectedRoute>
              <SavingsGoals />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            ANALYTICS - MILESTONE 4
        ============================== */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            REPORTS
        ============================== */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            PROFILE
        ============================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["normal", "premium", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            SETTINGS
        ============================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["normal", "premium", "admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            SECURITY
        ============================== */}

        <Route
          path="/security"
          element={
            <ProtectedRoute allowedRoles={["normal", "premium", "admin"]}>
              <Security />
            </ProtectedRoute>
          }
        />

        {/* ==============================
            ADMIN DASHBOARD
        ============================== */}

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminAnalytics />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminReports />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </RoleProtectedRoute>
          }
        />        <Route
          path="/admin/premium-users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminPremiumUsers />
            </RoleProtectedRoute>
          }
        />


        <Route
          path="/admin/users/:userId"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminUserDetails />
            </RoleProtectedRoute>
          }
        />

{/* ==============================`r`n            DEFAULT ROUTE`r`n        ============================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* ==============================
            INVALID ROUTE
        ============================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

      {/* ==============================
          GLOBAL TOAST
      ============================== */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />

    </BrowserRouter>
  );
}

export default App;



















