"use client";

import { useState, useEffect } from "react";
import { useToast } from "./ToastContext";
import supabase from "../config/supabaseClient";

// ✅ dynamically set redirect URL only when in browser
let DEFAULT_REDIRECT_TO = "";
if (typeof window !== "undefined") {
  DEFAULT_REDIRECT_TO = `${window.location.origin}/change-password`;
} else {
  // fallback for SSR builds (never used on client)
  DEFAULT_REDIRECT_TO = "https://your-production-domain.com/change-password";
}

export default function ResetPasswordForm({
  className = "",
  redirectTo = DEFAULT_REDIRECT_TO,
  onSuccess,
}) {
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      addToast({ type: "error", message: "Please enter your email." });
      return;
    }

    try {
      setIsSubmitting(true);

      // ✅ Ensure Supabase doesn't receive undefined/empty redirect
      const safeRedirect = redirectTo || DEFAULT_REDIRECT_TO;

      const { error } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo: safeRedirect }
      );

      if (error) {
        console.error("[ResetPasswordForm] Reset request failed", error);
        addToast({
          type: "error",
          message: error.message || "Could not send reset email.",
        });
      } else {
        addToast({
          type: "success",
          message: "Reset link sent! Please check your inbox.",
        });
        if (onSuccess) {
          onSuccess(trimmedEmail);
        }
      }
    } catch (error) {
      // ✅ catch any unexpected JSON.parse or network issue
      console.error("[ResetPasswordForm] Unexpected error", error);
      addToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-md mx-auto bg-surface border border-default shadow-md rounded-2xl p-6 md:p-8 ${className}`}
    >
      <h3 className="text-xl font-semibold mb-2 text-center">
        Reset your password
      </h3>

      <p className="text-sm text-muted-foreground mb-6 text-center">
        Enter your email address and we will send you a reset link.
      </p>

      <div className="flex flex-col gap-1 mb-5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-foreground/90"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2.5 rounded-lg text-white font-medium transition ${
          isSubmitting
            ? "bg-accent/60 cursor-not-allowed"
            : "bg-accent hover:bg-accent/90"
        }`}
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
