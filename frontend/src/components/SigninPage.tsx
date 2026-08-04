import toast, { Toaster } from "react-hot-toast";
import { useState } from "react"
import { Navigate } from "react-router";

import { useAuth } from "../context/AuthContext.tsx";
import { api } from "../api/api.ts";
import Loading from "./Loading.tsx";



import RegisterPage from "./RegisterPage";
import bbImage from "../assets/bb.png"

interface LoginFormData {
  username: string;
  password: string;
}


const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition bg-[rgba(15,20,26,0.7)] border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40";
const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";


const SigninPage = () => {
  const [registerClicked, setRegisterClicked] = useState(false)
  const { accessToken, setAccessToken, loading } = useAuth();

  const [loginData, setLoginData] = useState<LoginFormData>({
    username: "",
    password: ""
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  const handleLoginSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // expects multipart/form-data, so we can send the data as is
      const response = await api.post("/auth/login", loginData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Login response:", response.data)
      // localStorage.setItem("access_token", response.data.access_token);
      setAccessToken(response.data.access_token);
      toast.success("Login successful!");
    } catch (error: object | any) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        toast.error("Invalid username or password.");
        return;
      }
      console.error("Login error:", error)
      toast.error("Failed to login.")
    }
  }
  if (loading) {
    return <Loading />;
  }
  if (accessToken) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      {
        registerClicked ?
          <RegisterPage setRegisterClicked={setRegisterClicked} /> :
          (<div className="flex items-center justify-center min-h-screen p-4 md:p-6 bg-[radial-gradient(circle_at_20%_30%,#1a1e26,#0b0d10_80%)]">
            <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-black/40 bg-[rgba(22,28,36,0.85)] backdrop-blur-[6px] border border-white/5">
              <div className="w-full md:w-5/12 overflow-hidden group shrink-0">
                <img
                  src={bbImage}
                  alt="abstract dark landscape"
                  className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="w-full md:w-7/12 p-6 md:p-10 lg:p-12">
                <div className="mb-6 md:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-gray-400 text-sm mt-1.5">
                    Sign in to your account to continue
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="username" className={labelClass}>Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      required
                      placeholder="you@example.com"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className={labelClass}>Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg shadow-purple-600/20 transition-all bg-gradient-to-r from-purple-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-purple-500/40 active:scale-95"
                  >
                    Sign In
                  </button>

                  <p className="text-center text-sm text-gray-400 pt-2">
                    Don't have an account?
                    <button
                      type="button"
                      onClick={() => setRegisterClicked(true)}
                      className="text-purple-400 hover:text-purple-300 font-medium transition-colors ml-1"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>)
      }
    </>

  )
}

export default SigninPage