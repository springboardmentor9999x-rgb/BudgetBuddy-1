import { createBrowserRouter } from "react-router"

import HomePage from "./features/home/HomePage.tsx"
import ProtectedRoute from "./routes/ProtectedRoute.tsx"
import Navbar from "./features/Navbar.tsx"
import Auth from "./features/auth/page/Auth.tsx"

import IncomePage from "./features/income/page/Income.tsx"
import ExpensePage from "./features/expense/page/Expense.tsx"
import OtpVerify from "./features/auth/OtpVerify.tsx"
import AccountPage from "./features/account/page/AccountPage.tsx"
import NotFound from "./features/NotFound.tsx"
import Dashboard from "./features/dashboard/page/Dashboard.tsx"

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
            Component: () => <div>Budget Page</div>,
          },
          {
            path: "/saving-goals",
            Component: () => <div>Saving Goals Page</div>,
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
    path: "/verify-otp",
    Component: OtpVerify
  },
  {
    path: "*",
    Component: NotFound
  }
]);

export default router;