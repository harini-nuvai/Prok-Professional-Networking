/**
 * components/common/ProtectedRoute.tsx
 *
 * Wraps any route that requires authentication.
 * - While the initial /api/me check is running → show a spinner.
 * - If no valid token / user → redirect to /login.
 * - Otherwise → render the child route.
 */
import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait until the token-validation check finishes before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          {/* Spinning loader */}
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Checking session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Token missing or expired → send to login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
