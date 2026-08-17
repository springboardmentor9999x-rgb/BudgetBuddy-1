import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../features/auth/store/useAuthStore.ts";
import Loading from "../features/Loading.tsx";

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const authInitialized = useAuthStore(
    (state) => state.authInitialized
  );

  if (!authInitialized) {
    return <Loading />;
  }

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}