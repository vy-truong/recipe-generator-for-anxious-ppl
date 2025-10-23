"use client";

import AppHeader from "../components/AppHeader";
import MainSidebar from "../components/MainSidebar";
import ResetPasswordForm from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 flex">
        <MainSidebar className="hidden lg:flex" />
        <section className="relative flex-1">
          <div
            className="absolute inset-0 bg-[url('/img/signup-img1.jpg')] bg-cover bg-center opacity-25 lg:hidden"
            aria-hidden
          />
          <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 md:px-10 py-12 lg:py-16">
            <ResetPasswordForm className="w-full max-w-md rounded-3xl border border-default bg-surface/95 dark:bg-[var(--color-surfaced)]/95 p-6 sm:p-8 shadow-xl backdrop-blur" />
          </div>
        </section>
      </main>
    </div>
  );
}
