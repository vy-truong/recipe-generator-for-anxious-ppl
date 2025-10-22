"use client";

import AppHeader from "../components/AppHeader";
import BackLink from "../components/BackLink";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-app">
      <AppHeader />
      <main className="flex-1 w-full">
        <section className="relative flex-1">
          {/* Mobile/tablet background image overlay */}
          <div className="absolute inset-0 bg-[url('/img/signup-img1.jpg')] bg-cover bg-center opacity-20 lg:hidden" aria-hidden />
          {/* Desktop layout: 2 equal halves */}
          <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
            {/* LEFT — FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-14 lg:py-16 bg-surface/90 lg:bg-surface">
              <div className="w-full max-w-md scale-[1.2] space-y-6">
                <BackLink />
                <SignupForm />
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
