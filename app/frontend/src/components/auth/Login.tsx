/**
 * components/auth/Login.tsx
 *
 * Login form — calls POST /api/login, stores the JWT, redirects to /profile.
 * Shows field-level errors and a loading spinner while the request is in-flight.
 */
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { ApiError, authApi } from "../../lib/apiClient";

interface FormState {
  identifier: string; // username or email
  password: string;
}

interface FieldErrors {
  identifier?: string;
  password?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // successMessage is passed via navigate state from the Signup page
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage;

  const [form, setForm] = useState<FormState>({ identifier: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error as user types
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setBannerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setBannerError("");

    try {
      const res = await authApi.login({
        username_or_email: form.identifier,
        password: form.password,
      });

      // Store token + update global user state
      login(res.data.access_token, res.data.user);

      // Navigate to the protected profile page
      navigate("/profile", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          // Map server field names to our form field names
          const mapped: FieldErrors = {};
          if (err.errors.username_or_email) mapped.identifier = err.errors.username_or_email;
          if (err.errors.password) mapped.password = err.errors.password;
          setFieldErrors(mapped);
        }
        setBannerError(err.message);
      } else {
        setBannerError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 transition-all duration-300">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to your account</p>
        </div>

        {/* Success banner (shown after redirect from Signup) */}
        {successMessage && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error banner */}
        {bannerError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 animate-fadeIn">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            {bannerError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Username or Email */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={form.identifier}
              onChange={handleChange}
              disabled={loading}
              placeholder="you@example.com or your_username"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                fieldErrors.identifier
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.identifier && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.identifier}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                fieldErrors.password
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Link to signup */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
