"use client";

import { useEffect, useState } from "react";
import { Loader, Paper, Stack, Text, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import DeleteAccountSection from "../components/DeleteAccountSection";
import { useUser } from "../components/UserContext";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/login");
    }
    setIsChecking(false);
  }, [user, router]);

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
          <Paper radius="lg" withBorder p="xl" className="max-w-xl w-full bg-surface dark:bg-[var(--color-surfaced)]">
            <Stack gap="lg">
              <div className="text-center space-y-2">
                <Title order={2} className="text-[var(--color-heading)] dark:text-[var(--color-headingd)]">
                  Delete your account
                </Title>
                <Text size="sm" className="opacity-80">
                  Once your account is deleted, you will lose access to saved recipes and preferences. Please confirm you want to continue.
                </Text>
              </div>
              <DeleteAccountSection
                title="Permanently remove account"
                description="This action is permanent. Your account information and saved recipes will be removed."
              />
            </Stack>
          </Paper>
        </section>
      </main>
    </div>
  );
}
