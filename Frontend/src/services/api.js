import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    // Don't attach token for login/register requests
    if (
        token &&
        !config.url.includes("/auth/login") &&
        !config.url.includes("/auth/register")
    ) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("profileImage");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;