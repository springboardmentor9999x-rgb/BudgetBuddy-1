import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";

import './index.css'
import App from './App.tsx'
import Dashboard from './page/Dashboard.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ProtectedRoute from './routes/ProtectedRoute.tsx'
import OtpVerify from './components/auth/OtpVerify.tsx';
import Home from './page/Home.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    Component: Home, // works like a layout.
  },
  {
    path: "/dashboard",
    Component: ProtectedRoute,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
    ],
  },
  {
    path: "/verify-otp",
    Component: OtpVerify
  },
  {
    path: "/login",
    Component: App
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
