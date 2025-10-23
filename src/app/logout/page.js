"use client";

import { useEffect, useState } from "react";
import { Button, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import { useUser } from "../components/UserContext";
import { useToast } from "../components/ToastContext";
import supabase from "../config/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/login");
    }
    setIsChecking(false);
  }, [user, router]);

  const handleLogout = async () => {
    try {
      setIsProcessing(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[LogoutPage] Supabase signOut error", error);
        addToast({ type: "error", message: "Could not log out. Please try again." });
        setIsProcessing(false);
        return;
      }

      await refreshUser();
      addToast({ type: "success", message: "You have been logged out." });
      router.replace("/");
    } catch (error) {
      console.error("[LogoutPage] Unexpected error during logout", error);
      addToast({ type: "error", message: "Unexpected error. Please try again." });
      setIsProcessing(false);
    }
  };

  if (isChecking || (!user && typeof window !== "undefined")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16 flex items-center justify-center">
          <Paper radius="lg" withBorder p="xl" className="max-w-md w-full bg-surface dark:bg-[var(--color-surfaced)]">
            <Stack gap="md" align="center" className="text-center">
              <Title order={2} className="text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
                Ready to log out?
              </Title>
              <Text size="sm" className="opacity-80">
                You are currently signed in as{" "}
                <span className="font-semibold">{user?.email || "your account"}</span>.
                Logging out will clear your session on this device.
              </Text>
              <Stack gap="sm" className="w-full">
                <Button
                  radius="lg"
                  size="md"
                  color="orange"
                  loading={isProcessing}
                  onClick={handleLogout}
                >
                  Log me out
                </Button>
                <Button
                  radius="lg"
                  size="md"
                  variant="outline"
                  onClick={() => router.push("/menu")}
                  disabled={isProcessing}
                >
                  Stay logged in
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </section>
      </main>
    </div>
  );
}
