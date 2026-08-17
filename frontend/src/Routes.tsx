import { createBrowserRouter } from "react-router"

import HomePage from "./features/home/HomePage.tsx"
import ProtectedRoute from "./routes/ProtectedRoute.tsx"
import Navbar from "./features/Navbar.tsx"
import Auth from "./features/auth/page/Auth.tsx"
import RegisterPage from "./features/auth/RegisterPage.tsx"
import OtpVerify from "./features/auth/OtpVerify.tsx"

import Dashboard from "./features/dashboard/page/Dashboard.tsx"
import ExpensePage from "./features/expense/page/Expense.tsx"
import IncomePage from "./features/income/page/Income.tsx"
import AccountPage from "./features/account/page/AccountPage.tsx"
import BudgetPage from "./features/budget/page/BudgetPage.tsx"
import SavingGoals from "./features/saving_goals/page/SavingGoals.tsx"
import NotFound from "./features/NotFound.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: Navbar,
        children: [
          {
            path: "/dashboard",
            Component: Dashboard,
          },
          {
            path: "/expenses",
            Component: ExpensePage,
          },
          {
            path: "/income",
            Component: IncomePage
          },
          {
            path: "/budget",
            Component: BudgetPage,
          },
          {
            path: "/saving-goals",
            Component: SavingGoals,
          },
          {
            path: "/account",
            Component: AccountPage,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    Component: Auth
  },
  {
    path: "/register",
    Component: RegisterPage
  },
  {
    path: "/verify-otp",
    Component: OtpVerify
  },
  {
    path: "*",
    Component: NotFound
  }
]);

export default router;