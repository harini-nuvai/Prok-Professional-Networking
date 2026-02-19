import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  signup: async (payload) => (await api.post("/auth/signup", payload)).data,
  login: async (payload) => (await api.post("/auth/login", payload)).data,
  me: async () => (await api.get("/me")).data,
};

export default api;

