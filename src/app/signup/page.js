"use client";

import AppHeader from "../components/AppHeader";
import BackLink from "../components/BackLink";
import SignupForm from "../components/SignupForm";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-app text-[var(--color-text)] dark:text-[var(--color-textd)]">
      <AppHeader />
      <main className="flex-1 w-full flex">
        <section className="relative flex-1">
          {/* Mobile/tablet background image overlay */}
          <div
            className="absolute inset-0 bg-[url('/img/signup-img1.jpg')] bg-cover bg-center opacity-25 lg:hidden"
            aria-hidden
          />

          {/* Desktop layout: 2 equal halves */}
          <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
            {/* LEFT — FORM */}
            <div className="relative flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-6 md:px-10 py-12 lg:py-16">
              <div className="w-full max-w-md space-y-6 rounded-3xl border border-default bg-surface/95 dark:bg-[var(--color-surfaced)]/95 p-6 sm:p-8 shadow-xl backdrop-blur">
                <BackLink />
                <SignupForm onSuccess={handleSuccess} />
              </div>
            </div>

            {/* RIGHT — IMAGE */}
            <div className="hidden lg:block w-1/2">
              <div
                className="h-full w-full bg-[url('/img/signup-img.jpg')] bg-cover bg-center"
                aria-hidden
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
