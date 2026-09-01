import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../features/auth/store/useAuthStore.ts";
import Loading from "../features/Loading.tsx";
import toast from "react-hot-toast";

export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const authInitialized = useAuthStore((state) => state.authInitialized);

  useEffect(() => {
    if (authInitialized && user && user.role !== 'admin') {
      toast.error('Access Denied: Administrator privileges required.');
    }
  }, [authInitialized, user]);

  if (!authInitialized) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
