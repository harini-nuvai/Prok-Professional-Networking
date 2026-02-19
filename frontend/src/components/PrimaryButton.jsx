import React from "react";
import { motion } from "framer-motion";

export default function PrimaryButton({
  children,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  onClick,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn-primary ${className}`}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.99 } : {}}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

