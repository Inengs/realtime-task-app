// client/src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect to /login on 401
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TEMP: don't redirect on 401 — we're debugging
    // if (error.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
    //   localStorage.removeItem("token");
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);

export default api;