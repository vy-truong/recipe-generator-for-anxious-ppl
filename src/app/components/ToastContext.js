"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext({
  addToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ id, message, type = "info", duration = 4000 }) => {
    const toastId = id || crypto.randomUUID();
    setToasts((prev) => [...prev, { id: toastId, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    }, duration);
  };

  const value = useMemo(() => ({ addToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[1000]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl px-4 py-3 shadow-md border text-sm transition bg-white dark:bg-[var(--color-surfaced)] text-[var(--color-text)] dark:text-[var(--color-textd)]
              ${toast.type === "success" ? "border-green-300" : "border-default"}
              ${toast.type === "error" ? "border-red-300" : ""}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
