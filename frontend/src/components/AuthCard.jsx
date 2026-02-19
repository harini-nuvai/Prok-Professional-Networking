import React from "react";
import { motion } from "framer-motion";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="auth-card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
              <span className="text-slate-600 text-2xl">🔐</span>
            </div>
            <h2 className="text-3xl font-semibold text-slate-800 mb-2">{title}</h2>
            {subtitle ? <p className="text-slate-500 text-sm">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

