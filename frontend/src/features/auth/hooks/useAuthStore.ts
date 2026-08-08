import { useEffect } from "react";

import { useAuthStore } from "../../../store/AuthStore";
import { loginApi, logoutApi, refreshTokenApi, registerApi, verifyOtpApi, getUserProfileApi } from "../services/auth.api.ts";
import type { registerUser } from "../types/auth.type";

const useAuth = () => {

  const user = useAuthStore((state) => state.user);
  const email = useAuthStore((state) => state.email);
  const loading = useAuthStore((state) => state.loading);

  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setEmail = useAuthStore((state) => state.setEmail);
  const setLoading = useAuthStore((state) => state.setLoading);

  const loginUser = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await loginApi(email, password);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setLoading(false); // Ensure loading state is reset after the operation
    }
  }

  const registerUser = async (userData: registerUser) => {
    try {
      setLoading(true);
      const data = await registerApi(userData);
      setEmail(userData.email);
      return data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const verifyOtp = async (email: string, otp: string) => {
    try {
      setLoading(true);
      const data = await verifyOtpApi(email, otp);
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const refreshToken = async () => {
    try {
      setLoading(true);
      const data = await refreshTokenApi();
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const logoutUser = async () => {
    try {
      setLoading(true);
      await logoutApi();
      setUser(null);
      setAccessToken(null);
      setEmail("");
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const getUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfileApi();
      console.log('Fetched user profile:', data);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   async function getUserProfileOnMount() {
  //     try {
  //       setLoading(true);
  //       await getUserProfile();
  //     } catch (error) {
  //       console.error('Error fetching user profile on mount:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   getUserProfileOnMount();
  // }, []);


  return {
    user,
    email,
    loading,
    registerUser,
    loginUser,
    verifyOtp,
    refreshToken,
    logoutUser,
    getUserProfile,
  };
}

export default useAuth;