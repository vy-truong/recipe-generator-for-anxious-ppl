"use client";

// React imports
import { useState } from "react";
// Mantine UI imports
import {
  Alert,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
// Supabase client import
import supabase from "../config/supabaseClient";
import { useToast } from "./ToastContext";
import { useUser } from "./UserContext";

export default function LoginForm({ onSuccess }) {
  // ──────────────────────────────
  // STEP 1: Declare states
  // ──────────────────────────────
  const [email, setEmail] = useState(""); // store user's email input
  const [password, setPassword] = useState(""); // store user's password input
  const [errorMessage, setErrorMessage] = useState(""); // display error message
  const [isSubmitting, setIsSubmitting] = useState(false); // disable button while submitting
  const { addToast } = useToast();
  const { refreshUser } = useUser();

  // ──────────────────────────────
  // STEP 2: Helper validation functions
  // ──────────────────────────────
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const sanitizeEmail = (value) => value.trim(); // removes spaces
  const sanitizePassword = (value) => value.trim(); // only trim (don’t remove symbols!)

  // ──────────────────────────────
  // STEP 3: Handle form submission
  // ──────────────────────────────
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(""); // clear previous errors

    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    // Validate email
    if (!emailRegex.test(sanitizedEmail)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }

    // Validate password
    if (!sanitizedPassword || sanitizedPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Attempt to sign in user with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      console.log("[LoginForm] authResponse:", { data, error });

      if (error) {
        const message = error.message || "Login failed. Check your credentials.";
        setErrorMessage(message);
        addToast({ type: "error", message });
      } else {
        // Trigger callback when successful
        await refreshUser();
        addToast({ type: "success", message: "Welcome back! You are now signed in." });
        if (onSuccess) onSuccess(data);
      }
    } catch (err) {
      console.error("[LoginForm] Unexpected error:", err);
      setErrorMessage("Something went wrong. Please try again.");
      addToast({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────
  // STEP 4: Render UI
  // ──────────────────────────────
  return (
    <Paper
      component="form"
      radius="lg"
      p="xl"
      withBorder
      onSubmit={handleSubmit}
      shadow="sm"
      className="bg-surface text-[var(--color-text)] dark:text-[var(--color-textd)]"
    >
      <Stack gap="md">
        {/* Header */}
        <div>
          <Title order={3} className="text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
            Welcome back
          </Title>
          <Text size="sm" className="text-[var(--color-text)] dark:text-[var(--color-textd)] opacity-70">
            Sign in to continue cooking!
          </Text>
        </div>

        {/* Error message */}
        {errorMessage && (
          <Alert color="red" radius="md">
            {errorMessage}
          </Alert>
        )}

        {/* Email input */}
        <TextInput
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
        />

        {/* Password input */}
        <PasswordInput
          label="Password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          required
        />

        {/* Submit button */}
        <Button type="submit" size="md" radius="lg" loading={isSubmitting}>
          Log in
        </Button>

        {/* Forgot password link */}
        <Text size="sm" ta="center" mt="sm">
          Forgot your password?{" "}
          <a
            href="/reset-password"
            className="underline font-semibold transition hover:text-[var(--color-blue)]"
          >
            Reset it here
          </a>
        </Text>

        {/* doesnt have account yet link */}
        <Text size="sm" ta="center">
          Still haven’t got an account ?{" "}
          <a
            href="/signup"
            className=" underline font-semibold transition hover:text-[var(--color-blue)]"
          >
            Sign up here
          </a>
        </Text>
      </Stack>
    </Paper>
  );
}
