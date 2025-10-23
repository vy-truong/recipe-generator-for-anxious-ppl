"use client";

import { useState } from "react";
import { Button, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { useToast } from "./ToastContext";
import supabase from "../config/supabaseClient";

const DEFAULT_REDIRECT_TO =
  typeof window !== "undefined"
    ? `${window.location.origin}/change-password`
    : "http://localhost:3000/change-password";

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
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

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
      console.error("[ResetPasswordForm] Unexpected error", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      component="form"
      radius="lg"
      p="xl"
      withBorder
      onSubmit={handleSubmit}
      className={className}
    >
      <Stack gap="md">
        <Title order={3}>Reset your password</Title>
        <Text size="sm" c="dimmed">
          Enter your email address and we will send you a reset link.
        </Text>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          required
        />
        <Button type="submit" radius="lg" loading={isSubmitting}>
          Send reset link
        </Button>
      </Stack>
    </Paper>
  );
}
