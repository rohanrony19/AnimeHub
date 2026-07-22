import api from "../api";

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await api.post("/auth/login", loginData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const verifyOtp = async (data) => {
  const response = await api.post("/auth/verify-otp", data);

  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/reset-password", data);

  return response.data;
};