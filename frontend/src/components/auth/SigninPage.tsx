import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useShallow } from "zustand/shallow";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { useAuthStore } from "../../store/AuthStore.tsx";
import { api } from "../../api/api.ts";
import bbImage from "../../assets/bb.png";

type LoginFormData = {
  username: string;
  password: string;
};

const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition bg-[rgba(15,20,26,0.7)] border border-white/10 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40";
const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

const SigninPage = ({ setRegisterClicked }: { setRegisterClicked: React.Dispatch<React.SetStateAction<boolean>> }) => {

  const { accessToken, setAccessToken } = useAuthStore(useShallow((state) => ({
    accessToken: state.accessToken,
    setAccessToken: state.setAccessToken
  })));
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState<LoginFormData>({
    username: "",
    password: "",
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoginSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", loginData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Login response:", response.data);
      setAccessToken(response.data.access_token);
      toast.success("Login successful!");

      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Invalid username or password.");
        return;
      }
      console.error("Login error:", error);
      toast.error("Failed to login.");
    }
  };

  return (
    <>
      {accessToken && <Navigate to="/dashboard" />}
      <div className="flex items-center justify-center min-h-screen p-4 md:p-6 bg-[radial-gradient(circle_at_20%_30%,#1a1e26,#0b0d10_80%)]">
        <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl shadow-black/40 bg-[rgba(22,28,36,0.85)] backdrop-blur-[6px] border border-white/5">
          {/* Image side */}
          <div className="w-full md:w-5/12 overflow-hidden group shrink-0">
            <img
              src={bbImage}
              alt="abstract dark landscape"
              className="w-full h-64 md:h-full object-cover"
            />
          </div>

          {/* Form side */}
          <div className="w-full md:w-7/12 p-6 md:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-gray-400 text-sm mt-1.5">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label htmlFor="username" className={labelClass}>
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    placeholder="your username"
                    value={loginData.username}
                    onChange={handleLoginChange}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    <FaLock />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className={`${inputClass} pl-10 pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-semibold text-base shadow-lg shadow-purple-600/20 transition-all bg-linear-to-r from-purple-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-purple-500/40 active:scale-95"
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
      </div>
    </>
  );
};

export default SigninPage;