import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import TextInput from "../components/TextInput.jsx";
import { ToastContainer } from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";

export default function Login() {
  const { login } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const next = {};
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!validateEmail(formData.email)) next.email = "Please enter a valid email";
    if (!formData.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const res = await login(formData.email, formData.password);
    if (res.success) showToast("Login successful!", "success");
    else showToast(res.error || "Login failed", "error");
    setLoading(false);
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <AuthCard title="Login" subtitle="Sign in to continue">
        <form onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-slate-600 border-slate-300 rounded focus:ring-slate-400 accent-slate-500"
              />
              <span className="text-sm text-slate-600 font-medium">Remember me</span>
            </label>

            <button
              type="button"
              className="text-sm link-text"
              onClick={() => showToast("Forgot password (UI only)", "error")}
            >
              Forgot password?
            </button>
          </div>

          <PrimaryButton type="submit" loading={loading} disabled={loading}>
            Login
          </PrimaryButton>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link-text">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </>
  );
}

