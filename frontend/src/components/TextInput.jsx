import React from "react";
import { motion } from "framer-motion";

export default function TextInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  id,
  autoComplete,
}) {
  const inputId = id || `input-${name || label}`.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-2">
        {label}
        {required ? <span className="text-rose-400 ml-1">*</span> : null}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`input-field ${error ? "input-error" : ""}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
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

