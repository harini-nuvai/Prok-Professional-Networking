/**
 * components/auth/Signup.tsx
 *
 * Signup form — calls POST /api/signup.
 * On success: redirects to /login with a "Account created!" flash message.
 * Shows field-level errors under inputs and a top error banner on failure.
 */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError, authApi } from "../../lib/apiClient";

interface FormState {
  username: string;
  email: string;
  password: string;
}

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ username: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerError, setBannerError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setBannerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setBannerError("");

    try {
      await authApi.signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      // Redirect to /login with a success message in navigation state
      navigate("/login", {
        replace: true,
        state: { successMessage: "Account created! Please sign in." },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          setFieldErrors(err.errors as FieldErrors);
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-gray-500">Join us today — it's free</p>
        </div>

        {/* Error banner */}
        {bannerError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9v4a1 1 0 102 0V9a1 1 0 10-2 0zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            {bannerError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              placeholder="cooluser42"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                fieldErrors.username
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                fieldErrors.email
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                fieldErrors.password
                  ? "border-red-400 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Min 8 characters · 1 uppercase · 1 lowercase · 1 digit
            </p>
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
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
