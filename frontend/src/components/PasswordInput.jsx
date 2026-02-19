import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

function getStrength(password) {
  if (!password) return { strength: 0, label: "", color: "" };
  let s = 0;
  if (password.length >= 8) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^a-zA-Z\d]/.test(password)) s++;

  if (s <= 1) return { strength: s, label: "Weak", color: "text-rose-400", bar: "bg-rose-300" };
  if (s === 2) return { strength: s, label: "Fair", color: "text-amber-400", bar: "bg-amber-300" };
  if (s === 3) return { strength: s, label: "Good", color: "text-sky-400", bar: "bg-sky-300" };
  return { strength: s, label: "Strong", color: "text-emerald-400", bar: "bg-emerald-300" };
}

export default function PasswordInput({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  id,
  autoComplete,
  showStrengthIndicator = false,
}) {
  const [show, setShow] = useState(false);
  const inputId = id || `password-${name || label}`.toLowerCase().replace(/\s+/g, "-");
  const strength = useMemo(() => (showStrengthIndicator ? getStrength(value) : null), [value, showStrengthIndicator]);

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required ? <span className="text-rose-400 ml-1">*</span> : null}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input-field pr-10 ${error ? "input-error" : ""}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>

      {showStrengthIndicator && value ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${strength.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${(strength.strength / 4) * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
            <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
          </div>
        </motion.div>
      ) : null}

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-error`}
          className="mt-1 text-sm text-rose-500"
          role="alert"
        >
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}

