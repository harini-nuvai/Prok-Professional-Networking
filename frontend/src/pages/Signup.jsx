import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PrimaryButton from "../components/PrimaryButton.jsx";
import TextInput from "../components/TextInput.jsx";
import { ToastContainer } from "../components/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../hooks/useToast.js";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    // soft realtime validation (only when user has typed something)
    setErrors((prev) => {
      const next = { ...prev };

      if (name === "username") {
        if (value.trim() && value.trim().length < 3) next.username = "Username must be at least 3 characters";
        else delete next.username;
      }

      if (name === "email") {
        if (value.trim() && !validateEmail(value)) next.email = "Please enter a valid email";
        else delete next.email;
      }

      if (name === "password") {
        if (value && value.length < 8) next.password = "Password must be at least 8 characters";
        else delete next.password;

        if (formData.confirmPassword && value !== formData.confirmPassword) next.confirmPassword = "Passwords do not match";
        else if (formData.confirmPassword) delete next.confirmPassword;
      }

      if (name === "confirmPassword") {
        if (value && value !== formData.password) next.confirmPassword = "Passwords do not match";
        else delete next.confirmPassword;
      }

      return next;
    });
  };

  const validateForm = () => {
    const next = {};
    if (!formData.username.trim()) next.username = "Username is required";
    else if (formData.username.trim().length < 3) next.username = "Username must be at least 3 characters";

    if (!formData.email.trim()) next.email = "Email is required";
    else if (!validateEmail(formData.email)) next.email = "Please enter a valid email";

    if (!formData.password) next.password = "Password is required";
    else if (formData.password.length < 8) next.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (formData.confirmPassword !== formData.password) next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const isFormValid = () =>
    formData.username.trim().length >= 3 &&
    validateEmail(formData.email) &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword &&
    Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fix the errors first", "error");
      return;
    }

    setLoading(true);
    const res = await signup(formData.username, formData.email, formData.password);
    setLoading(false);

    if (res.success) {
      showToast("Account created! Please login.", "success");
      setTimeout(() => navigate("/login"), 1200);
    } else {
      showToast(res.error || "Signup failed", "error");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <AuthCard title="Create account" subtitle="A few details and you’re in">
        <form onSubmit={handleSubmit} noValidate>
          <TextInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="Your username"
            required
            autoComplete="username"
          />

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
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            showStrengthIndicator
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter password"
            required
            autoComplete="new-password"
          />

          <PrimaryButton type="submit" loading={loading} disabled={!isFormValid() || loading}>
            Create account
          </PrimaryButton>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link-text">
                Login
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </>
  );
}

