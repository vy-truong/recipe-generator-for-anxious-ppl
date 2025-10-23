"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "./UserContext";
import { buildSidebarLinks } from "./MainSidebar";
import { TbChefHat } from "react-icons/tb";

const navigationLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
];

export default function AppHeader() {
  const pathname = usePathname() || "/";
  const { user, setRedirectPath } = useUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const sidebarLinks = useMemo(() => buildSidebarLinks(Boolean(user)), [user]);

  // store redirect path for login/signup
  const handleAuthLinkClick = (href) => {
    if (href === "/login") {
      setRedirectPath(pathname === "/login" ? "/" : pathname);
    }
    if (href === "/signup") {
      setRedirectPath("/login");
    }
  };

  // track viewport width
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleSizeChange = (event) => {
      setIsLargeScreen(event.matches);
      if (event.matches) {
        setIsDrawerOpen(false);
      }
    };

    setIsLargeScreen(mediaQuery.matches);
    if (mediaQuery.matches) setIsDrawerOpen(false);

    mediaQuery.addEventListener("change", handleSizeChange);
    return () => mediaQuery.removeEventListener("change", handleSizeChange);
  }, []);

  // track dark mode class on <html>
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const burgerColor = isDarkMode
    ? "var(--color-heading)"
    : "var(--color-heading)"; // same var now

  const handleDrawerLinkClick = (href) => {
    if (href === "/login" || href === "/signup") {
      handleAuthLinkClick(href);
    }
    setIsDrawerOpen(false);
  };

  return (
    <header className="w-full sticky top-0 z-20 bg-[var(--color-surface)] dark:bg-[var(--color-surfaced)] border-b border-default shadow-sm transition-colors duration-300">
      <nav className="w-full px-6 sm:px-10 lg:px-16 py-3 sm:py-5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label="MotiChef home">
          <span className="inline-flex h-10 w-5 items-center text-heading justify-center">
            <TbChefHat size={20} />
          </span>
          <span className="font-semibold text-lg text-heading">MotiChef</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* desktop links */}
          {isLargeScreen &&
            navigationLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => handleAuthLinkClick(href)}
                className="rounded-xl px-3 py-2 text-sm border border-default bg-surface hover:opacity-90 transition text-[var(--color-text)]"
              >
                {label}
              </Link>
            ))}

          {/* burger icon for mobile */}
          {!isLargeScreen && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-default bg-surface hover:opacity-90 transition lg:hidden"
              aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {/* top line */}
              <span
                className="absolute h-0.5 w-6 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: burgerColor,
                  top: isDrawerOpen ? "50%" : "30%",
                  left: "50%",
                  transform: isDrawerOpen
                    ? "translate(-50%, -50%) rotate(45deg)"
                    : "translate(-50%, -50%)",
                }}
              />
              {/* middle line */}
              <span
                className="absolute h-0.5 w-6 rounded-full transition-opacity duration-150"
                style={{
                  backgroundColor: burgerColor,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: isDrawerOpen ? 0 : 1,
                }}
              />
              {/* bottom line */}
              <span
                className="absolute h-0.5 w-6 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: burgerColor,
                  top: isDrawerOpen ? "50%" : "70%",
                  left: "50%",
                  transform: isDrawerOpen
                    ? "translate(-50%, -50%) rotate(-45deg)"
                    : "translate(-50%, -50%)",
                }}
              />
            </button>
          )}
        </div>
      </nav>

      {/* drawer overlay + menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="bg-surface dark:bg-[var(--color-surfaced)] w-64 sm:w-80 h-full shadow-lg border-l border-default flex flex-col p-6 space-y-3 animate-slide-in-right">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-heading">Navigation</h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-[var(--color-text)] hover:text-[var(--color-heading)] transition"
              >
                ✕
              </button>
            </div>

            {/* drawer links */}
            <div className="flex flex-col gap-3 overflow-y-auto">
              {sidebarLinks.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => handleDrawerLinkClick(href)}
                  className="rounded-xl border border-default px-4 py-3 bg-surface hover:opacity-90 transition inline-flex items-center gap-2 text-[var(--color-text)]"
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
