"use client";

import { useEffect, useState } from "react";
import { Button, Paper, PasswordInput, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import { useToast } from "../components/ToastContext";
import { useUser } from "../components/UserContext";
import supabase from "../config/supabaseClient";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, refreshUser } = useUser();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      await refreshUser();
      setIsChecking(false);
    };

    verifyUser();
  }, [refreshUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      addToast({ type: "error", message: "Please log in before changing your password." });
      router.push("/login");
      return;
    }

    if (newPassword.trim().length < 8) {
      addToast({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });

      if (error) {
        console.error("[ChangePasswordPage] Failed to update password", error);
        addToast({ type: "error", message: error.message || "Could not update password." });
      } else {
        addToast({ type: "success", message: "Password updated successfully." });
        setNewPassword("");
        setConfirmPassword("");
        router.push("/results");
      }
    } catch (error) {
      console.error("[ChangePasswordPage] Unexpected error", error);
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
                <Title order={3}>Choose a new password</Title>
                <Text size="sm" c="dimmed">
                  Enter a strong password that you have not used before.
                </Text>
                <PasswordInput
                  label="New password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.currentTarget.value)}
                  required
                />
                <PasswordInput
                  label="Confirm new password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                  required
                />
                <Button type="submit" radius="lg" loading={isSubmitting || isChecking}>
                  Update password
                </Button>
              </Stack>
            </Paper>
          </div>
        </section>
      </main>
    </div>
  );
}
