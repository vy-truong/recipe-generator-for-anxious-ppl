"use client";

import { useState } from "react";
import { Button, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import { useToast } from "../components/ToastContext";
import supabase from "../config/supabaseClient";

const DEFAULT_REDIRECT_TO =
  typeof window !== "undefined"
    ? `${window.location.origin}/change-password`
    : "http://localhost:3000/change-password";

export default function ResetPasswordPage() {
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
        redirectTo: DEFAULT_REDIRECT_TO,
      });

      if (error) {
        console.error("[ResetPasswordPage] Reset request failed", error);
        addToast({ type: "error", message: error.message || "Could not send reset email." });
      } else {
        addToast({
          type: "success",
          message: "Reset link sent! Please check your inbox.",
        });
      }
    } catch (error) {
      console.error("[ResetPasswordPage] Unexpected error", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-lg">
            <Paper component="form" radius="lg" p="xl" withBorder onSubmit={handleSubmit}>
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
          </div>
        </section>
      </main>
    </div>
  );
}
