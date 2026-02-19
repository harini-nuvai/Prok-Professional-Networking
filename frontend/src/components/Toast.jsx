import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const bg = type === "success" ? "bg-emerald-400" : "bg-rose-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, x: "-50%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed top-4 left-1/2 z-50 ${bg} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px] max-w-md`}
      role="status"
      aria-live="polite"
    >
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        type="button"
        className="text-white/90 hover:text-white focus:outline-none"
        onClick={onClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <AnimatePresence>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </AnimatePresence>
  );
}

