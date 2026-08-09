import { useEffect } from "react";
import { RouterProvider } from "react-router";
import router from "./Routes.tsx";
import { useAuthStore } from "./features/auth/store/useAuthStore.ts";

function App() {
  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <RouterProvider router={router} />;
}

export default App;