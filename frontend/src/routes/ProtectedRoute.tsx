import { Outlet, Navigate } from "react-router"
// import { useShallow } from "zustand/shallow";

import { useAuthStore } from "../store/AuthStore.ts";

export function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  return (<Outlet />);
}

export default ProtectedRoute;