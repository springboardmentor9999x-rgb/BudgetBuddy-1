import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";

import './index.css'
import Dashboard from './page/Dashboard.tsx'
import ProtectedRoute from './routes/ProtectedRoute.tsx'
import OtpVerify from './components/auth/OtpVerify.tsx';
import Navbar from './components/Navbar.tsx';
import AuthPage from './page/AuthPage.tsx';
import NotFound from './page/NotFound.tsx';
import ExpensePage from './components/expense/Expense.tsx';
import IncomePage from './components/income/Income.tsx';
import AccountPage from './components/account/Account.tsx';
import { Toaster } from 'react-hot-toast';


const router = createBrowserRouter([
  {
    path: "/",
    Component: Dashboard,
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
    path: "/verify-otp",
    Component: OtpVerify
  },
  {
    path: "/login",
    Component: AuthPage
  },
  {
    path: "*",
    Component: NotFound
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <AuthProvider> */}
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <RouterProvider router={router} />
    </>
    {/* </AuthProvider> */}
  </StrictMode>,
)
