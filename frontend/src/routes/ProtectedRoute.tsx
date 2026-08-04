import { Outlet, Navigate } from "react-router"
import { useAuth } from "../context/AuthContext.tsx";
import Loading from "../components/Loading.tsx";


export function ProtectedRoute() {
  const { loading, accessToken } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  if (!accessToken) return <Navigate to="/login" replace />;

  return <>
    <Outlet />
  </>;
}

export default ProtectedRoute;