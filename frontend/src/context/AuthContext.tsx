// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

import { api } from "../api/api.ts";

// import { useNavigate } from "react-router";

interface AuthContextType {
  accessToken: string | null;
  loading: boolean;
  email: string | null;
  setEmail: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;

  // login: (user: User, accessToken: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext(
  {
    accessToken: null,
    loading: true,
    email: null,
    setEmail: () => { },
    logout: async () => { },
    setLoading: () => { },
    setAccessToken: () => { },
  } as AuthContextType
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // const navigate = useNavigate();

  useEffect(() => {
    // On first mount, try to fetch the user with a refresh token (if any)
    async function fetchUser() {
      try {
        const res = await api.get("/auth/refresh-token");
        setAccessToken(res.data.access_token);
      } catch (err) {
        setAccessToken(null); // no valid refresh cookie → truly logged out
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);


  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, loading, logout, email, setEmail, setLoading, setAccessToken }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);