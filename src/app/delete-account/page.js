"use client";

import { useEffect, useState } from "react";
import { Loader } from "@mantine/core";
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
      <div className="min-h-screen flex items-center justify-center bg-app text-[var(--color-text)] dark:text-[var(--color-text)]">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-text)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />

        <section className="flex-1 px-4 sm:px-6 py-10 sm:py-12 lg:py-16 flex items-center justify-center">
          <div className="max-w-xl w-full rounded-2xl border border-default bg-surface dark:bg-[var(--color-surface)] shadow-md p-8 sm:p-10">
            <DeleteAccountSection />
          </div>
        </section>
      </main>
    </div>
  );
}
