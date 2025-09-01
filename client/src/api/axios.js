import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

// Request interceptor: attach token if exists
API.interceptors.request.use(
  (config) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
      if (userInfo?.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (err) {
      // ignore parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
