import { Outlet, Navigate } from "react-router"
import { useShallow } from "zustand/shallow";

import { useAuthStore } from "../store/AuthStore.tsx";

export function ProtectedRoute() {
  const { accessToken, user } = useAuthStore(useShallow((state) => ({
    accessToken: state.accessToken,
    user: state.user
  })));

  if (!accessToken && !user) return <Navigate to="/login" replace />;

  return (<Outlet />);
}

export default ProtectedRoute;